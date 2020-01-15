import React from 'react';

import Constants from '../../utils/constants';

export default class Home extends React.Component {
    static async crawlHorses() {
        const horses = await fetch(`${Constants.baseUrl}/api/horses/scrape`);
        console.log(horses);
    }

    static async crawlAllRaces() {
        const races = await fetch(`${Constants.baseUrl}/api/races/scrape`);
        console.log(races);
    }

    render() {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
                <h1>Welcome to Horsies!</h1>
                <div style={{ display: 'flex', width: '30%', justifyContent: 'space-around', alignItems: 'center'}}>
                    <button
                        onClick={() => Home.crawlHorses()}
                    >Crawl Horses</button>
                    <button
                        onClick={() => Home.crawlAllRaces()}
                    >Crawl Races</button>
                </div>

                <div style={{
                    position: 'fixed',
                    top: '0',
                    left: '0',
                    height: '10em',
                    width: '10em',
                    margin: '1em 0 0 1em',
                    background: 'url("horsies_logo.png")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                }} />
            </div>
        )
    }
}
