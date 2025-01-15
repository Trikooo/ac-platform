# Customer Experience / Administration Console Platform

## Features

- **User Authentication**: Secure login and registration for users.
- **Role-Based Access**: Admins can manage products and orders efficiently.
- **Product Management**: Admins can create, update, and delete products.
- **Shopping Cart**: Users can add, remove, and update products in their cart.
- **Responsive Design**: Optimized for both desktop and mobile devices.
- **Integrated Order Management**: Admins can manage their orders in one place.

## Tech Stack

- **Frontend**:

  - React
  - TypeScript
  - Tailwind CSS
  - Shadcn

- **Backend**:

  - Next.js
  - Prisma
  - PostgreSQL

- **Authentication**:
  - NextAuth.js

## Getting Started

### Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/yourusername/ac-platform.git
   ```

2. **Navigate to the project directory**:

   ```bash
   cd ac-platform
   ```

3. **Install dependencies**:

   Using `npm`:

   ```bash
   npm install
   ```

   Or using `bun`:

   ```bash
   bun install
   ```

4. **Set up your PostgreSQL database**:  
   Update the environment variables in the `.env` file with your configuration:

   ```plaintext
   # PostgreSQL Database
   DATABASE_URL
   DIRECT_DATABSE_URL
   # Cloudflare R2
   R2_BUCKET_NAME
   R2_ENDPOINT
   R2_SECRET_ACCESS_KEY
   R2_ACCESS_KEY_ID
   R2_TOKEN
   R2_PUBLIC_ENDPOINT

   # Authentication
   NEXTAUTH_URL
   NEXTAUTH_SECRET
   DISCORD_CLIENT_SECRET
   DISCORD_CLIENT_ID
   GOOGLE_CLIENT_SECRET
   GOOGLE_CLIENT_ID

   # Additional services
   NOEST_TOKEN
   NOEST_GUID

   # Email configuration
   ADMIN_EMAILS
   EMAIL_SERVER
   ```

5. **Run database migrations**:

   ```bash
   npx prisma migrate dev
   ```

6. **Start the development server**:

   ```bash
   npm run dev
   ```

7. **Open your browser**:  
   Navigate to `http://localhost:3000`.

## License

This project is licensed under the Creative Commons Attribution-NonCommercial 4.0 International License (CC BY-NC 4.0).
See the [LICENSE](LICENSE) file for more details.

---

Thank you for checking out this project! Feel free to contact me if you have any questions or projects to get done.
