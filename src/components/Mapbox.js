import React, { useRef, useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'
import mapboxgl from 'mapbox-gl';
import numeral from 'numeral';
import env from '../config';

const { access_token, mapbox_url } = env

mapboxgl.accessToken = access_token

const Mapbox = ({ allCoordinates }) => {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const [lng] = useState(-70.9);
    const [lat] = useState(42.35);
    const [zoom] = useState(1);
    const [showState, setShowState] = useState(true)


    const handleClickToggle = () => {
        setShowState(!showState)
    }


    useEffect(() => {
        if (map.current) return; // initialize map only once

        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: mapbox_url,
            center: [lng, lat],
            zoom: zoom,
            attributionControl: false,
            doubleClickZoom:false
            // renderWorldCopies: false
        });

        const popup = new mapboxgl.Popup({
            closeButton: false,
            closeOnClick: false,

        })

        const mapOverlayContent = document.querySelector('.map-overlay-content')

        const { total_cases, deaths, recovered } = allCoordinates.summary

        mapOverlayContent.innerHTML = `
        <h1>${numeral(total_cases).format('0,0')}</h1>
        <p>Total Cases</p>
        <h1>${numeral(deaths).format('0,0')}</h1>
        <p>Deaths</p>
        <h1>${numeral(recovered).format('0,0')}</h1>
        <p>Total Recovered</p>
        `

        map.current.on('load', () => {
            map.current.addSource('countries', {
                'type': 'vector',
                'url': 'mapbox://mapbox.country-boundaries-v1',
            })


            const matchExpression = ['match', ['get', 'iso_3166_1']]

            const newCoordinates = Object.values(allCoordinates.regions)
            newCoordinates.push({ name: 'China', iso3166a2: 'CN', total_cases: 93701, recovered: 87558, deaths: 4636 })

            newCoordinates.map((value) => {
                const { total_cases, iso3166a2, name } = value

                const color = total_cases > 5000000 ?
                    '#7a0505' :
                    total_cases <= 5000000 && total_cases > 500000 ?
                        '#970707' :
                        total_cases <= 500000 && total_cases > 50000 ?
                            '#bd0a0a' :
                            total_cases <= 50000 && total_cases > 5000 ?
                                '#de0d0d' :
                                total_cases <= 5000 && total_cases > 0 ?
                                    '#f22c2c' :
                                    '#ffedc1'


                let helpIso = name === 'Lesotho' ?
                    'LS' :
                    name === 'Diamond Princess' ?
                        'TT-PRT' :
                        name === 'Wallis and Futuna' ?
                            'WF' :
                            name === 'Solomon Islands' ?
                                'SB' :
                                name === 'Ms Zaandam' ?
                                    '_ZA' :
                                    name === 'Marshall Islands' ?
                                        'MH' :
                                        name === 'Vanuatu' ?
                                            'VU' :
                                            name === 'Samoa' ?
                                                'WS' :
                                                name === 'British Virgin islands' ?
                                                    'VG' :
                                                    iso3166a2

                matchExpression.push(helpIso, color)

                return null
            })

            matchExpression.push('#494c50')

            map.current.addLayer(
                {
                    'id': 'countries-layer',
                    'type': 'fill',
                    'source': 'countries',
                    'source-layer': 'country_boundaries',
                    'paint': {
                        'fill-color': matchExpression
                    }
                },
                'admin-1-boundary-bg'
            )

            const getRelatedData = (isoCode) => {
                return newCoordinates.filter(value => value.iso3166a2 === isoCode)[0]
            }

            const showPopup = (e) => {
                map.current.getCanvas().style.cursor = 'pointer';

                const { iso_3166_1 } = e.features[0].properties;
                const relatedData = getRelatedData(iso_3166_1)

                if (relatedData) {
                    const { total_cases, deaths, name, recovered } = relatedData
                    // create element
                    const popupElement = `
                    <h1 class="popup-title">${name}</h1>
                    <div class="cases">
                        <p><span class="total-cases">${numeral(total_cases).format('0,0')}</span> confirmed cases</p>
                        <p><span class="death-cases">${numeral(deaths).format('0,0')}</span> deaths</p>
                        <p><span class="recovered-cases">${numeral(recovered).format('0,0')}</span> recovered</p>
                    </div>
                    </div>
                    `

                    // render popup
                    popup
                        .setLngLat(e.lngLat)
                        .setHTML(popupElement)
                        .addTo(map.current)
                }
            }


            map.current.on('mousemove', 'countries-layer', (e) => {
                showPopup(e)
            })

            map.current.on('click', 'countries-layer', (e) => {
                showPopup(e)
            })

            map.current.on('mouseleave', 'countries-layer', () => {
                map.current.getCanvas().style.cursor = '';
                popup.remove();
            });

        })


        // map.current.addControl(
        //     new mapboxgl.GeolocateControl({
        //         positionOptions: {
        //             enableHighAccuracy: true
        //         },
        //         trackUserLocation: true,
        //         showUserHeading: true
        //     })
        // );
        map.current.addControl(new mapboxgl.NavigationControl());

        map.current.dragRotate.disable();

        map.current.touchZoomRotate.disableRotation()

    }, [allCoordinates.regions, allCoordinates.summary, lat, lng, zoom]);

    return (
        <div>
            <div ref={mapContainer} className="map-container" />
            <div id={'map-overlay'} className={'map-overlay'}>
                <div onClick={handleClickToggle} className={'togle-mapbox-overlay'}>
                    {
                        showState ? (
                            <React.Fragment>
                                <FontAwesomeIcon icon={faEyeSlash} />
                                <p>Hide</p>
                            </React.Fragment>
                        ) : (
                            <React.Fragment>
                                <FontAwesomeIcon icon={faEye} />
                                <p>Show</p>
                            </React.Fragment>
                        )
                    }
                </div>
                <div className={`shown-overlay ${showState ? '' : 'hide-overlay'}`}>
                    <fieldset>
                        <legend>Simple COVID-19 Map</legend>
                        <hr className={'divider-overlay'} />
                        <div className={'map-overlay-content'}>
                        </div>
                    </fieldset>
                </div>
            </div>
        </div>
    )
}

export default Mapbox