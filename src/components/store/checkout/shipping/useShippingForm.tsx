import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import getWilayaData from "@/services/wilayaDataService";
import { Address, Wilayas } from "@/types/types";
import { Option } from "@/components/ui/better-select";
import {
  parseCommunes,
  parseNoestStations,
  parseWilayas,
} from "@/utils/wilayaDataParser";
import { toast } from "@/hooks/use-toast";

import { useAddress } from "@/context/AddressContext";
import { useAddressRequest } from "@/hooks/address/useAddress";
import { useSession } from "next-auth/react";
import { AlertCircle } from "lucide-react";

export default function useShippingForm() {
  const router = useRouter();
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const { addresses, setAddresses, selectedAddress, setSelectedAddress } =
    useAddress();

  const { handleCreateAddress } = useAddressRequest();
  // const [address, setAddress] = useState<Address>({
  //   fullName: "",
  //   phoneNumber: "",
  //   wilayaValue: "",
  //   wilayaLabel: "",
  //   commune: "",
  //   address: "",

  //   stopDesk: false,
  // });

  const [addressLoading, setAddressLoading] = useState<boolean>(false);
  const [addressError, setAddressError] = useState<boolean>(false);
  const [wilayaData, setWilayaData] = useState<Wilayas | null>(null);
  const [wilayaError, setWilayaError] = useState<boolean>(false);
  const [wilayaLoading, setWilayaLoading] = useState<boolean>(false);
  const [wilayaOptions, setWilayaOptions] = useState<Option[]>([]);
  const [communeOptions, setCommuneOptions] = useState<Option[]>([]);
  const [selectedWilaya, setSelectedWilaya] = useState<Option[]>([]);
  const [selectedCommune, setSelectedCommune] = useState<Option[]>([]);
  const [addSecondPhone, setAddSecondPhone] = useState<boolean>(false);
  const [selectedStopDesk, setSelectedStopDesk] = useState<Option[]>([]);
  const [wilayaHasStopDesk, setWilayaHasStopDesk] = useState<boolean>(false);
  const [stopDeskOptions, setStopDeskOptions] = useState<Option[]>([]);

  // First useEffect to fetch Wilaya data
  useEffect(() => {
    const fetchWilayaData = async () => {
      setWilayaLoading(true);
      try {
        const data = await getWilayaData();
        if (data) {
          setWilayaData(data);
          const parsedWilayaOptions = parseWilayas(data);
          setWilayaOptions(parsedWilayaOptions);

          // Pre-select Wilaya if exists in kotekOrder
          if (selectedAddress.wilayaValue) {
            const matchedWilaya = parsedWilayaOptions.find(
              (option) => option.value == selectedAddress.wilayaValue
            );
            if (matchedWilaya) {
              setSelectedWilaya([matchedWilaya]);
            }
          }

          setWilayaLoading(false);
        }
      } catch (error) {
        setWilayaError(true);
      } finally {
        setWilayaLoading(false);
      }
    };
    if (!wilayaData) {
      fetchWilayaData();
    }
  }, [wilayaData, selectedAddress.wilayaValue]);

  // Second useEffect for populating communes
  useEffect(() => {
    if (wilayaOptions.length > 0 && wilayaData && selectedWilaya.length > 0) {
      const communes = parseCommunes(wilayaData, selectedWilaya[0].value);
      if (communes) {
        setCommuneOptions(communes);

        // Pre-select Commune if exists in kotekOrder
        if (selectedAddress.commune) {
          const matchedCommune = communes.find(
            (option) => option.value === selectedAddress.commune
          );
          if (matchedCommune) {
            setSelectedCommune([matchedCommune]);
          }
        }
      }
    }
    if (selectedWilaya.length < 1) {
      setCommuneOptions([]);
      setSelectedCommune([]);
    }
  }, [wilayaOptions, wilayaData, selectedWilaya, selectedAddress.commune]);

  // Third useEffect for stop desk options
  useEffect(() => {
    const wilaya = selectedWilaya[0];
    if (
      wilaya &&
      wilayaData &&
      wilayaData[wilaya.label].noest.stations.length > 0
    ) {
      setWilayaHasStopDesk(true);
      const noestStations = parseNoestStations(wilayaData, wilaya.value);
      if (noestStations) {
        setStopDeskOptions(noestStations);

        // Pre-select stop desk if stationCode exists
        if (selectedAddress.stationCode) {
          const matchedStopDesk = noestStations.find(
            (option) => option.value === selectedAddress.stationCode
          );
          if (matchedStopDesk) {
            setSelectedStopDesk([matchedStopDesk]);

            // Ensure stopDesk is checked if a station is selected

            setSelectedAddress((prev) => ({
              ...prev,
              stopDesk: true,
            }));
          }
        }
      }
    } else {
      setWilayaHasStopDesk(false);
      setSelectedStopDesk([]);
    }
  }, [
    wilayaData,
    selectedWilaya,
    selectedAddress.stationCode,
    setSelectedAddress,
  ]);

  useEffect(() => {
    if (
      wilayaData &&
      selectedAddress.wilayaLabel &&
      selectedWilaya.length > 0
    ) {
      if (selectedAddress.stopDesk) {
        setSelectedAddress((prev) => ({
          ...prev,
          shippingPrice:
            wilayaData[selectedAddress.wilayaLabel].noest.prices.stopDesk,
        }));
      } else {
        setSelectedAddress((prev) => ({
          ...prev,
          shippingPrice:
            wilayaData[selectedAddress.wilayaLabel].noest.prices.home,
        }));
      }
    }
  }, [
    selectedAddress.stopDesk,
    selectedAddress.wilayaLabel,
    setSelectedAddress,
    selectedWilaya,
    wilayaHasStopDesk,
    wilayaData,
  ]);

  // Validation and continue handler
  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reusable validation function
    const showValidationError = (description: string) => {
      toast({
        title: (
          <>
            <AlertCircle className="w-5 h-5" strokeWidth={1.5} /> {description}
          </>
        ),

        variant: "destructive",
      });
    };

    // Validation checks
    if (!selectedAddress.fullName?.trim()) {
      return showValidationError("Please enter your full name.");
    }

    if (!selectedAddress.phoneNumber?.trim()) {
      return showValidationError("Please enter a phone number.");
    }

    if (!selectedAddress.address?.trim()) {
      return showValidationError("Please enter your address.");
    }

    if (selectedWilaya.length === 0) {
      return showValidationError("Please select a wilaya.");
    }

    if (selectedCommune.length === 0) {
      return showValidationError("Please select a commune.");
    }

    if (
      selectedAddress.stopDesk &&
      wilayaHasStopDesk &&
      selectedStopDesk.length === 0
    ) {
      return showValidationError(
        "Please select a stop desk station or uncheck the box."
      );
    }

    if (userId) {
      try {
        setAddressLoading(true);
        setSelectedAddress(selectedAddress);
        await handleCreateAddress(selectedAddress, userId);

        router.push("/checkout/review");
        setAddresses((prev) => {
          // If prev is not an array, start with an empty array
          const currentAddresses = Array.isArray(prev) ? prev : [];
          // Add the new address
          return [...currentAddresses, selectedAddress];
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: (
            <>
              <AlertCircle className="w-5 h-5" strokeWidth={1.5} /> Uh oh, there
              was a problem
            </>
          ),
          description: "Refresh the page and try again.",
        });
      } finally {
        setAddressLoading(false);
      }
    } else {
      setSelectedAddress(selectedAddress);
      router.push("/checkout/review");
      setAddresses((prev) => {
        // If prev is not an array, start with an empty array
        const currentAddresses = Array.isArray(prev) ? prev : [];
        // Add the new address
        return [...currentAddresses, selectedAddress];
      });
    }
    // Navigate to the next page
  };

  return {
    wilayaOptions,
    communeOptions,
    selectedWilaya,
    setSelectedWilaya,
    selectedCommune,
    setSelectedCommune,
    wilayaLoading,
    wilayaError,
    addSecondPhone,
    setAddSecondPhone,
    selectedStopDesk,
    setSelectedStopDesk,
    wilayaHasStopDesk,
    stopDeskOptions,
    handleContinue,
    addressLoading,
    wilayaData,
  };
}
