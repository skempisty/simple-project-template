import React from 'react';

import Constants from '../../utils/constants';

export default class Home extends React.Component {
    async crawlHorses() {
        const horses = await fetch(`${Constants.baseUrl}/api/horses/scrape`);
        console.log(horses);
    }

    render() {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
                <h1>Welcome to Horsies!</h1>
                <div style={{ display: 'flex', width: '30%', justifyContent: 'space-around', alignItems: 'center'}}>
                    <button
                        onClick={this.crawlHorses.bind(this)}
                    >Crawl Horses</button>
                    <button>Crawl Races</button>
                </div>
            </div>
        )
    }
}
