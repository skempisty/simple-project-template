import React from 'react';

import Constants from '../../utils/constants';

export default class Home extends React.Component {
    constructor(props) {
        super(props);

        this.state = { horsesYear: '2020' };
    }

    async crawlHorses() {
        const { horsesYear } = this.state;

        const horses = await fetch(`${Constants.baseUrl}/api/horses/scrape?year=${horsesYear}`);
        console.log(horses);
    }

    async crawlAllRaces() {
        const races = await fetch(`${Constants.baseUrl}/api/races/scrape`);
        console.log(races);
    }

    render() {
        const { horsesYear } = this.state;

        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                fontFamily: 'sans-serif'
            }}>
                <div style={{
                    height: '8em',
                    width: '8em',
                    margin: '0 auto',
                    background: 'url("horsies_logo.png")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                }} />

                <div style={{
                    marginTop: '1em'
                }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            width: '8em'
                        }}>
                            <div>
                                Horses:
                            </div>
                            <select
                                value={horsesYear}
                                onChange={(e) => this.setState({ horsesYear: e.target.value })}
                            >
                                <option value="2020">2020</option>
                                <option value="2019">2019</option>
                                <option value="2018">2018</option>
                                <option value="2017">2017</option>
                                <option value="2016">2016</option>
                                <option value="2015">2015</option>
                                <option value="2014">2014</option>
                                <option value="2013">2013</option>
                                <option value="2012">2012</option>
                                <option value="2011">2011</option>
                                <option value="2010">2010</option>
                                <option value="2009">2009</option>
                                <option value="2008">2008</option>
                                <option value="2007">2007</option>
                                <option value="2006">2006</option>
                                <option value="2005">2005</option>
                                <option value="2004">2004</option>
                                <option value="2003">2003</option>
                                <option value="2002">2002</option>
                                <option value="2001">2001</option>
                                <option value="2000">2000</option>
                            </select>
                        </div>

                        <button
                            style={{ marginLeft: '1em' }}
                            onClick={() => this.crawlHorses()}
                        >Crawl</button>
                    </div>

                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginTop: '1em'
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            width: '8em'
                        }}>
                            <div>
                                Races:
                            </div>
                        </div>


                        <button
                            style={{ marginLeft: '1em' }}
                            onClick={() => this.crawlAllRaces()}
                        >Crawl</button>
                    </div>
                </div>
            </div>
        )
    }
}
