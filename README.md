# Pinkmate

A React Native mobile app for booking at-home beauty and salon services. Built with Expo and powered by Firebase Realtime Database.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Native + Expo (SDK 54) |
| Routing | Expo Router (file-based) |
| Backend / Database | Firebase Realtime Database |
| Authentication | Firebase Auth |
| State Management | Zustand |
| Server State / Caching | TanStack React Query |
| Forms & Validation | React Hook Form + Zod |
| Styling | NativeWind (Tailwind CSS for RN) |
| Animations | React Native Reanimated |
| Maps & Location | Expo Location + React Native Maps + Google Places Autocomplete |
| Image Handling | Expo Image + Expo Image Picker |
| Icons | Lucide React Native |

---

## Project Structure

```
pinkmate/
├── app/                        # Expo Router screens
│   ├── (auth)/                 # Unauthenticated routes
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── (tabs)/                 # Bottom tab screens
│   │   ├── index.tsx           # Home
│   │   ├── bookings.tsx        # My Bookings
│   │   ├── favorites.tsx       # Saved services
│   │   └── profile.tsx         # User profile
│   ├── booking/index.tsx       # Checkout flow
│   ├── category/
│   │   ├── index.tsx           # All categories
│   │   └── [id].tsx            # Category detail + services
│   └── service-details/[id].tsx
├── src/
│   ├── components/ui/          # Reusable UI components
│   ├── config/                 # Firebase, theme, constants
│   ├── hooks/                  # Custom React hooks
│   ├── services/               # Firebase read/write/auth
│   ├── store/                  # Zustand stores
│   ├── types/                  # TypeScript interfaces
│   └── utils/                  # Helpers (e.g. Firebase error messages)
```

---

## Features

### Authentication

- **Email/password sign-in** with Zod-validated form and Firebase Auth error mapping to human-readable messages.
- **Registration** collects: full name, email, phone number, gender, state, city, and password with confirmation. State and city are fetched dynamically from an India geography API via `useIndiaStates` / `useIndiaCities` hooks and rendered as searchable pickers.
- **Guest mode** — users can browse the app without an account. Booking, favorites, and profile management require sign-in.
- **Session persistence** via `expo-secure-store`. On app launch, `hydrate()` restores the authenticated user from secure storage automatically.
- **Auto location update** on sign-in and sign-up — the user's GPS coordinates are saved to their Firebase profile immediately after authentication.

---

### Home Screen

- **Time-aware greeting** — displays "Good Morning / Afternoon / Evening" based on the current hour.
- **Location display** — shows the user's saved city. Tapping it opens a full-screen location picker (GPS + Google Places Autocomplete) to update their location, which is saved to Firebase.
- **Profile avatar** — shows the user's photo or initials. Tapping navigates to the profile screen.
- **Cart icon** — always visible in the header, shows item count badge.
- **Search bar** — text input for filtering services by name.
- **Banner carousel** — auto-scrolling promotional banners fetched from Firebase. Only active banners are displayed.
- **Featured categories** — horizontally scrollable row of active, featured categories. "View All" navigates to the full categories grid.
- **Popular services** — horizontally scrollable row of featured active services with quick "Book Now" action.
- **Testimonials section** — static customer review cards with name, location, star rating, and review text.
- **Floating cart bar** — persistent bar at the bottom when the cart has items, showing total and a "View Cart" button.
- **Pull-to-refresh** support throughout.

---

### Categories

- **All Categories screen** — 2-column grid of all active categories with image and name. Skeleton loading placeholders shown while data loads.
- **Category Detail screen** — shows services belonging to a category. Includes:
  - Category image and name in the header.
  - **Subcategory filter chips** — horizontal scrollable pills to filter services by subcategory. Selecting "All" removes the filter.
  - 2-column services grid filtered by selected subcategory.
  - Empty state when no services match the filter.

---

### Service Details

- **Hero image** with linear gradient overlay, discount badge, and service type badge (At Home / At Salon).
- **Price strip** — displays discounted price with the original crossed out, duration, service location, and rating.
- **Estimated savings** indicator when a discount applies.
- **About section** — full description of the service.
- **Add-ons** — optional extras that can be toggled on/off. Each add-on shows name, description, additional price, and additional duration. Selecting an add-on automatically adds the service to the cart if not already there.
- **What's included / What's not included** — checklist items pulled from the service data.
- **Related services** — horizontally scrollable list of other active services from the same category.
- **Favorite button** — heart icon in the header to save/unsave the service (requires auth).
- **Sticky bottom bar** — shows the effective price (including selected add-ons) and a "Book Now" button that adds the service to the cart and navigates to checkout.
- **Floating cart bar** while browsing, showing running total.

---

### Cart & Checkout

- **Cart management** — add, remove, and adjust quantity of services. Each item also shows its selected add-ons.
- **Estimated duration** — dynamically calculated total session time across all items and add-ons.
- **Date picker** — horizontally scrollable chip selector for the next 7 days, labelled "Today" / "Tomorrow" / short weekday format.
- **Time slot picker** — 11 available slots from 09:00 AM to 07:00 PM in a wrapping chip grid.
- **Delivery address** — shows the user's saved address/city from their profile.
- **Coupon code** — text input with an "Apply" button. Validates against Firebase coupons: checks active status, validity date range, and minimum order amount. Applied coupon shows the code and description with a remove option.
- **Payment method selector** — Cash, Card, or Online as toggle chips.
- **Optional notes** — multiline text input for special instructions.
- **Bill summary** — shows subtotal, discount (if any), and final total.
- **Confirm booking** — writes the booking to Firebase with full detail including `statusTimeline` (initialised with a `Pending` entry and timestamp). Shows a loading spinner while submitting.
- **Success screen** — full-screen animated confirmation with a checkmark, message, and buttons to view bookings or return home. Cart is cleared on success.

---

### My Bookings

- **Real-time updates** — bookings are subscribed via Firebase `onValue` listener. Status changes made from the admin dashboard appear instantly without any manual refresh.
- **Sorted by newest first** — bookings displayed in reverse chronological order.
- **Status badge** — colour-coded badge per booking status: Pending (amber), Confirmed / Partner Assigned (blue), On The Way / Service Started (green), Completed (emerald), Cancelled (red).
- **Booking card** — shows service names, scheduled date and time, delivery address, and final amount.
- **Expandable timeline** — tapping a booking card expands a vertical progress timeline showing each status stage with a timestamp of when it was reached. Completed stages show a green checkmark, the current active stage is highlighted in pink, and future stages are greyed out.
- **Pull-to-refresh** — supported (data is already live, the gesture provides user feedback).
- **Skeleton loading** placeholders during initial load.

---

### Favorites

- **Save services** — authenticated users can heart any service from the detail screen or service cards. State is persisted to Firebase under the user's favorites path.
- **Favorites screen** — lists all saved services as cards with full service details.
- **Optimistic updates** — the favorite state updates instantly in the UI via Zustand before the Firebase write completes.
- **Empty state** with a call-to-action to explore services.

---

### User Profile

- **Profile card** — shows avatar, full name, email, and total booking count.
- **Edit profile** — bottom sheet modal with fields for full name, phone number, state/city (dynamic dropdowns), and gender (Male / Female / Other toggle). Changes saved to Firebase and synced to local auth store.
- **Profile photo** — camera icon on the avatar opens the image picker. Cropped to 1:1, compressed to 80% quality, uploaded to Firebase Storage. Photo URL saved to the user's profile and reflected immediately.
- **Menu items** — navigable rows for: Booking History, Favorites, Notifications, Saved Addresses, Help & Support, Privacy Policy, Terms & Conditions.
- **Logout** — clears auth state and redirects to the login screen.
- **Guest state** — unauthenticated users see a prompt with Sign In and Create Account buttons instead of the profile card and menu.

---

### Notifications

- Real-time subscribed via Firebase `onValue` under the user's notifications path.
- Supports marking individual notifications and all notifications as read.

---

### Coupons

- Fetched from Firebase with full metadata: code, description, discount type (percentage or flat), discount value, max discount cap, minimum order amount, validity window, and active status.
- Validation at checkout time: checks active flag, date range, and minimum order value before applying.

---

## State Management

Three Zustand stores manage global client state:

**`authStore`** — current user object, authentication status, guest mode flag, and actions for sign-in, sign-up, logout, and session hydration.

**`bookingStore`** — the active cart: services, quantities, selected add-ons, scheduled date/time, selected address, applied coupon, payment method, and notes. Computed getters for subtotal, discount, and total. Resets completely after a successful booking.

**`favoritesStore`** — a `Set<string>` of favourite service IDs. Optimistic toggle: updates the set immediately and writes to Firebase asynchronously.

---

## Data Layer

**`database.ts`** provides both one-shot `get()` fetches and real-time `onValue` subscriptions for all collections: categories, subcategories, services, add-ons, banners, coupons, bookings, addresses, notifications, and favorites.

**`mutations.ts`** handles all writes: create booking (with initial timeline), update booking status (appends to `statusTimeline`), cancel booking, save/update/delete addresses, toggle favorites, and mark notifications read.

**`auth.ts`** wraps Firebase Auth for sign-in, sign-up (with user profile write to RTDB), logout, and profile updates including photo upload to Firebase Storage.

---

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file with your Firebase config keys (see `.env.example` if present).

3. Start the development server:
   ```bash
   npx expo start
   ```

4. Scan the QR code with Expo Go, or run on a simulator:
   ```bash
   npx expo run:android
   npx expo run:ios
   ```
