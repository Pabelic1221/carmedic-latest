# CarMedic

CarMedic is a powerful car diagnostic tool designed for vehicle owners and mechanics. It provides an intuitive interface to identify and troubleshoot car issues efficiently.

## Features

- **Real-time Diagnostics**: Access real-time data from your car's onboard computer.
- **Error Code Lookup**: Quickly look up error codes with detailed explanations.
- **Maintenance Reminders**: Set reminders for scheduled maintenance tasks.
- **Vehicle History**: Keep track of your car's diagnostic history.

## Installation

Follow these steps to install CarMedic:

1. Clone the repository:
    ```bash
    git clone https://github.com/yourusername/carmedic.git
    ```
2. Navigate to the project directory:
    ```bash
    cd carmedic
    ```
3. Install dependencies:
    ```bash
    npm install
    ```

## Running the Mobile App in Development Mode

CarMedic is built with Expo for React Native development. To run the mobile app:

1. Start the development server:
    ```bash
    npx expo start
    ```
2. Install the Expo Go app on your Android device from the [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent).
3. Scan the QR code displayed in the terminal using the Expo Go app to launch CarMedic.

## Dependencies Installation Guide

Ensure your system meets the following requirements before installing dependencies:

### Prerequisites

- **Node.js**: Install from [nodejs.org](https://nodejs.org/).
- **npm**: Comes bundled with Node.js.
- **Git**: Install from [git-scm.com](https://git-scm.com/).

### Installing Dependencies

After cloning the repository, install project dependencies:

```bash
npm install
```

Additional dependencies may be required for specific features:

- **Express** (for backend services):
    ```bash
    npm install express
    ```

Check the `package.json` file for a complete list of dependencies.

## Database Setup

CarMedic uses Firebase for data storage. To set up Firebase:

1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Create or select an existing project.
3. Register your app and copy the Firebase configuration object.
4. Install Firebase in your project:
    ```bash
    npm install firebase
    ```
5. Create a `firebase.js` file and initialize Firebase:
    ```javascript
    import firebase from 'firebase/app';
    import 'firebase/firestore';

    const firebaseConfig = {
        apiKey: "YOUR_API_KEY",
        authDomain: "YOUR_AUTH_DOMAIN",
        projectId: "YOUR_PROJECT_ID",
        storageBucket: "YOUR_STORAGE_BUCKET",
        messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
        appId: "YOUR_APP_ID"
    };

    firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();

    export { db };
    ```

### Environment Variables

Store sensitive configuration details in a `.env` file:

```
REACT_APP_FIREBASE_API_KEY=YOUR_API_KEY
REACT_APP_FIREBASE_AUTH_DOMAIN=YOUR_AUTH_DOMAIN
REACT_APP_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
REACT_APP_FIREBASE_STORAGE_BUCKET=YOUR_STORAGE_BUCKET
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=YOUR_MESSAGING_SENDER_ID
REACT_APP_FIREBASE_APP_ID=YOUR_APP_ID
```

## Software Requirements

Ensure your system meets the following requirements:

### Operating System

- **Windows**: Windows 10 or later
- **macOS**: macOS 10.15 (Catalina) or later
- **Linux**: Any modern distribution with Node.js support

### Android Requirements

- **OS**: Android 8.0 (Oreo) or later
- **RAM**: Minimum 2GB
- **Storage**: At least 100MB free space

## Contributing

We welcome contributions! Follow these steps to contribute:

1. Fork the repository.
2. Create a new branch:
    ```bash
    git checkout -b feature-branch
    ```
3. Make changes and commit:
    ```bash
    git commit -m "Description of changes"
    ```
4. Push to your branch:
    ```bash
    git push origin feature-branch
    ```
5. Open a pull request.


## Contact

For issues or suggestions, open an issue on GitHub or contact us at nacua.regner@gmail.com / paullinejoy0802@gmail.com / shanebaguhin9@gmail.com or pabelicjush@gmail.com..



