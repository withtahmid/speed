import { useEffect, useState } from "react";
import { updateInterval } from "./config";

type GPS = { coords: { latitude: number; longitude: number } };

function App() {
    const [error, setError] = useState<string | null>();
    const [speed, setSpeed] = useState<number>();
    const [lastPosition, setLastPosition] = useState<GPS | null>();

    const calculateDistance = (
        lat1: number,
        lon1: number,
        lat2: number,
        lon2: number
    ) => {
        const R = 6371e3;
        const φ1 = (lat1 * Math.PI) / 180;
        const φ2 = (lat2 * Math.PI) / 180;
        const Δφ = ((lat2 - lat1) * Math.PI) / 180;
        const Δλ = ((lon2 - lon1) * Math.PI) / 180;
        const a =
            Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    const updateSpeed = (position: GPS) => {
        console.log({ position });
        if (lastPosition) {
            const distance = calculateDistance(
                lastPosition.coords.latitude,
                lastPosition.coords.longitude,
                position.coords.latitude,
                position.coords.longitude
            );
            const speedKmph = distance / 1000 / (updateInterval / 3600000);
            setSpeed(speedKmph);
            setError(null);
        }
        setLastPosition(position);
    };

    useEffect(() => {
        if (!("geolocation" in navigator)) {
            setError("Geolocation is not supported by this browser.");
            return;
        }
        setInterval(() => {
            setError(null);
            navigator.geolocation.watchPosition(
                updateSpeed,
                () => setError("Unable to retrieve location."),
                {
                    enableHighAccuracy: true,
                    maximumAge: 1000,
                    timeout: 5000,
                }
            );
        }, updateInterval);
    }, []);

    return (
        <div className="flex flex-col w-full h-screen items-center justify-center">
            <h1 className="text-7xl text-center font-bold">
                {error ? error : speed ? speed.toFixed(2) : "..."}
            </h1>
        </div>
    );
}

export default App;
