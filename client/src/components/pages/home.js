import React from 'react';

import Constants from '../../utils/constants';

export default class Home extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            horsesYear: '2020',
            horsesFromYear: '2020',
            horsesToYear: '2020'
        };
    }

    async crawlHorses() {
        const { horsesYear } = this.state;

        const horses = await fetch(`${Constants.baseUrl}/api/horses/scrape?year=${horsesYear}`);
        console.log(horses);
    }

    async crawlAllRaces() {
        const { horsesFromYear, horsesToYear } = this.state;

        const races = await fetch(`${Constants.baseUrl}/api/races/scrape?horsesFromYear=${horsesFromYear}&horsesToYear=${horsesToYear}`);
        console.log(races);
    }

    /**
     * Returns the years that horse/race data is available for on equibase
     *
     * @returns {number[]}
     */
    get equibaseRecordYears() {
        return [
            2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012,2011,
            2010, 2009, 2008, 2007, 2006, 2005, 2004, 2003, 2002, 2001,
            2000
        ];
    }

    get availableFromYears() {
        const { horsesToYear } = this.state;

        return this.equibaseRecordYears.filter((year) => {
           return year <= horsesToYear;
        });
    }

    get availableToYears() {
        const { horsesFromYear } = this.state;

        return this.equibaseRecordYears.filter((year) => {
            return year >= horsesFromYear;
        });
    }

    render() {
        const { horsesYear, horsesFromYear, horsesToYear } = this.state;

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
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginTop: '1em'
                }}>
                    <div style={{ fontWeight: 'bold' }}>Horses</div>

                    <div style={{ display: 'flex', marginTop: '0.5em' }}>
                        <span>Year:</span>
                        <select
                            value={horsesYear}
                            onChange={(e) => this.setState({ horsesYear: e.target.value })}
                        >
                            {this.equibaseRecordYears.map((year) =>
                                <option value={year}>{year}</option>
                            )}
                        </select>

                        <button
                            style={{ marginLeft: '1em', cursor: 'pointer', boxShadow: '1px 1px 5px grey' }}
                            onClick={() => this.crawlHorses()}
                        >
                            Crawl
                        </button>
                    </div>
                </div>

                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginTop: '1em'
                }}>
                    <div style={{ fontWeight: 'bold' }}>Races</div>

                    <div style={{ display: 'flex', marginTop: '0.5em' }}>
                        <span>From year:</span>
                        <select
                            value={horsesFromYear}
                            onChange={(e) => this.setState({ horsesFromYear: e.target.value })}
                        >
                            {this.availableFromYears.map((year) =>
                                <option value={year}>{year}</option>
                            )}
                        </select>

                        <span style={{ marginLeft: '1em' }}>To year:</span>
                        <select
                            value={horsesToYear}
                            onChange={(e) => this.setState({ horsesToYear: e.target.value })}
                        >
                            {this.availableToYears.map((year) =>
                                <option value={year}>{year}</option>
                            )}
                        </select>

                        <button
                            style={{ marginLeft: '1em', cursor: 'pointer', boxShadow: '1px 1px 5px grey' }}
                            onClick={() => this.crawlAllRaces()}
                        >
                            Crawl
                        </button>
                    </div>
                </div>
            </div>
        )
    }
}
