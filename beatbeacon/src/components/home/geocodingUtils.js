export const fetchLocationDetails = async (latitude, longitude) => {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data && data.address) {
            const city = data.address.city || data.address.town || data.address.village || 'Unknown City';
            const state = data.address.state || 'Unknown State';
            const country = data.address.country || 'Unknown Country';

            return { city, state, country };
        } else {
            return { city: 'Unknown City', state: 'Unknown State', country: 'Unknown Country' };
        }
    } catch (error) {
        console.error('Error in reverse geocoding:', error);
        return { city: 'Unknown City', state: 'Unknown State', country: 'Unknown Country' };
    }
};
