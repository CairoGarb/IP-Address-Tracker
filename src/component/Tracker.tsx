import { useEffect, useState } from 'react';
import './Tracker.css'
import LoadingIcons from 'react-loading-icons'
import 'leaflet/dist/leaflet.css'
import { Icon } from 'leaflet'
import markerIconPng from '/Users/Cairo/ip-address-tracker/node_modules/leaflet/dist/images/marker-icon.png'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'

export function Tracker() {

    const [ipAddress, setIpAddress] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')

    const [ipValue, setIpValue] = useState('')
    const [cityValue, setCityValue] = useState('')
    const [regionValue, setRegionValue] = useState('')
    const [postalCodeValue, setpostalCodeValue] = useState('')
    const [timeZoneValue, settimeZoneValue] = useState('')
    const [ispValue, setIspValue] = useState('')

    const [latValue, setLatValue] = useState(0)
    const [lngValue, setLngValue] = useState(0)

    // Get the ip data from domain
    async function getLocationDataDomain() {
        try {
            setIsLoading(true)
            const response = await fetch(`https://geo.ipify.org/api/v2/country,city?apiKey=at_gwN5qpOqHxjCLn6m5B2mjJTISRxIU&domain=${ipAddress}`);
            if (!response.ok) {
                setError('Failed to get data');
            }
            const data = await response.json();
            return data.ip;
        } catch (error) {
            console.error('Error fetching data:', error);
            setError('Failed to get data');
            return null;
        } finally {
            setIsLoading(false)
        }
    }

    function isValidIpAddress(ipAddress:any) {
        const ipRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
        return ipRegex.test(ipAddress);
    }

    // get the ip data from ip
    async function getLocationData() {
        try {
            setIsLoading(true)
            let useIpAddress = ipAddress
            // analize if the ip provided is a real ip, if not, uses the domain function
            if (!isValidIpAddress(ipAddress)) {
                useIpAddress = await getLocationDataDomain();
            }

            const response = await fetch(`https://geo.ipify.org/api/v2/country,city?apiKey=at_gwN5qpOqHxjCLn6m5B2mjJTISRxIU&ipAddress=${useIpAddress}`);
            if (!response.ok) {
                setError('Failed to get data');
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching data:', error);
            setError('Failed to get data');
            return null;
        } finally {
            setIsLoading(false)
        }
    }

    async function displayLocationData() {
        const data = await getLocationData();

        if (data) {
            setIpValue(data.ip);
            setRegionValue(data.location.region + ',');
            setCityValue(data.location.city);
            setpostalCodeValue(data.location.postalCode);
            settimeZoneValue(data.location.timezone);
            setIspValue(data.isp)
            setLatValue(data.location.lat);
            setLngValue(data.location.lng);
            setError('')
        }
    }

    // Recenter the map, using the latitude and longitude values
    const RecenterAutomatically = ({ lat, lng }: {lat: number, lng: number}) => {
        const map = useMap();
        useEffect(() => {
            map.setView([lat, lng]);
        }, [lat, lng]);
        return null;
    }

    useEffect(() => {
        displayLocationData();
    }, [])

    return (
        <div className="trackerContainer">
            <header>
                <div className="headercontainer">

                    <div className="title">
                        <h1>IP Address Tracker</h1>
                    </div>

                    <div className="input">
                        <label htmlFor="ip">
                            <input
                                type='text'
                                id='ip'
                                placeholder='Search for any IP address or domain'
                                onChange={(e) => setIpAddress(e.target.value)}
                                onKeyUp={
                                    (e) => {
                                        if (e.key === 'Enter') {
                                            displayLocationData();
                                        }
                                    }
                                }
                            />
                        </label>

                        <div className="btn-header">
                            <button onClick={displayLocationData}>
                                {isLoading ? (
                                    <div className="loading">
                                        <LoadingIcons.SpinningCircles height={15} speed={2} fill='#fff' />
                                    </div>
                                ) : (
                                    <img src='./icon-arrow.svg' alt='arrow icon' />
                                )}
                            </button>
                        </div>

                        <div className='errorMsg'>{error}</div>

                        <div className="absoluteContainer">

                            <div className="ipAddress">
                                <p>IP Address</p>
                                <p className="ipValue">{ipValue}</p>
                            </div>

                            <div className="location">
                                <p>Location</p>
                                <p className="locationValue">
                                    {regionValue} {cityValue} {postalCodeValue}
                                </p>
                            </div>

                            <div className="timezone">
                                <p>Timezone</p>
                                <p className="timezoneValue">
                                    {timeZoneValue}
                                </p>
                            </div>

                            <div className="isp">
                                <p>ISP</p>
                                <p className="ispValue">
                                    {ispValue}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="mapContainer">
                <MapContainer center={[latValue, lngValue]} zoom={14} scrollWheelZoom={false}>
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                    />
                    <Marker position={[latValue, lngValue]} icon={new Icon({iconUrl: markerIconPng, iconSize: [25, 41], iconAnchor: [12, 41]})}>
                        <Popup>
                            {regionValue} {cityValue} {postalCodeValue}
                        </Popup>
                    </Marker>
                    <RecenterAutomatically lat={latValue} lng={lngValue} />
                </MapContainer>
            </div>
        </div>
    )
}