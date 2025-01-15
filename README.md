# Customer Experience / Administration Console Platform


## Features

- **User Authentication**: Secure login and registration for users.
- **Role-Based Access**: Admins can manage products and orders efficiently.
- **Product Management**: Admins can create, update, and delete products.
- **Shopping Cart**: Users can add, remove, and update products in their cart.
- **Responsive Design**: Optimized for both desktop and mobile devices.
- **Integrated Order Management**: Admins can manage their order in one place. 


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

1. Clone the repository:

   ```bash

   git clone https://github.com/yourusername/ac-platform.git

   ```

2. Navigate to the project directory:

   ```bash
   cd ac-platform
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

   or

   ```bash
   bun install
   ```

4. Set up your PostgreSQL database and update the environment variables in the `.env` file:

   ```plaintext
  # PostgreSQL Database
DATABASE_URL

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

5. Run database migrations:

   ```bash
   npx prisma migrate dev
   ```

6. Start the development server:

   ```bash
   npm run dev
   ```

7. Open your browser and navigate to `http://localhost:3000`.


## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.



---

Thank you for checking out this project! feel free to contact me if you have any questions or projects to get done. 
