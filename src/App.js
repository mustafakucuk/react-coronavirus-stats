import React from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Select from 'react-select';
import {
    AreaChart, ResponsiveContainer, Area, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';

const API_BASE_URL = 'https://api.covid19api.com';
const DEFAULT_COUNTRY = 'turkey';

class App extends React.Component {
    constructor(props) {
        super(props);
        this.selectRef = React.createRef();
        this.state = {
            selectedCountry: DEFAULT_COUNTRY,
            defaultCountry: '',
            isLoading: true,
            countryList: [],
            stats: [],
            chartStats: [],
            selectedCountryData: [],
        }
    }

    componentDidMount() {
        this.getData();
    }

    numberFormat(number) {
        return new Intl.NumberFormat().format(number);
    }

    getData() {
        fetch(API_BASE_URL + '/summary')
            .then(res => res.json())
            .then((result) => {
                result = result.Countries;
                this.setState({
                    isLoading: false,
                    stats: result,
                });
                this.setCountries();
                this.setCountryData(this.state.selectedCountry)
                this.getChartData();
            })
    }

    getChartData() {
        const selectedCountry = this.state.selectedCountry;

        fetch(API_BASE_URL + '/dayone/country/' + selectedCountry + '/status/confirmed')
            .then(res => res.json())
            .then((result) => {
                result.map((res) => {
                    const date = new Date(res.Date);
                    const month = date.getMonth();
                    const day = date.getDate();
                    res.Date = day + ' - ' + month
                });

                this.setState({
                    chartStats: result
                });

                this.getChartStats()
            })
    }

    getCaseCount() {
        const {selectedCountryData, isLoading} = this.state;
        return isLoading ? '...' : this.numberFormat(selectedCountryData.TotalConfirmed);
    }

    getRecoveredCount() {
        const {selectedCountryData, isLoading} = this.state;
        return isLoading ? '...' : this.numberFormat(selectedCountryData.TotalRecovered);
    }

    getDeathCount() {
        const {selectedCountryData, isLoading} = this.state;
        return isLoading ? '...' : this.numberFormat(selectedCountryData.TotalDeaths);
    }

    getNewCaseCount() {
        const {selectedCountryData, isLoading} = this.state;
        return isLoading ? '...' : this.numberFormat(selectedCountryData.NewConfirmed);
    }

    getNewRecoveredCount() {
        const {selectedCountryData, isLoading} = this.state;
        return isLoading ? '...' : this.numberFormat(selectedCountryData.NewRecovered);
    }

    getNewDeathCount() {
        const {selectedCountryData, isLoading} = this.state;
        return isLoading ? '...' : this.numberFormat(selectedCountryData.NewDeaths);
    }

    getChartStats() {
        const {chartStats, isLoading} = this.state;
        return isLoading ? [] : chartStats;
    }

    getCountryList() {
        const {countryList, isLoading} = this.state;
        return isLoading ? [] : countryList;
    }

    setCountries() {
        const {isLoading, stats} = this.state;
        if (isLoading) {
            return;
        }

        const countries = [];
        let defaultCountry = '';

        stats.map(function (country) {
            const countryData = {
                value: country.Slug,
                label: country.Country
            };

            if (country.Slug == DEFAULT_COUNTRY) {
                defaultCountry = countryData;
            }

            countries.push(countryData)
        });

        this.setState({
            countryList: countries
        });

        if (!this.state.defaultCountry) {
            this.setState({
                defaultCountry
            })
        }
    }

    setCountryData(countrySlug) {
        const {stats, isLoading} = this.state;
        if (!isLoading) {
            const selectedCountryData = stats.filter(function (country) {
                return country.Slug === countrySlug;
            });

            this.setState({
                selectedCountryData: selectedCountryData[0]
            })
        }
    }

    changeCountry(country) {
        this.setState({
            selectedCountry: country.value,
            defaultCountry: country
        });

        this.getData();
    }

    getDefaultCountry() {
        return this.state.defaultCountry;
    }

    render() {
        return (
            <div className="App">
                <Container>
                    <Row className={'mb-20'}>
                        <Col sm={12} className='mb-20'>
                            <Select ref={this.selectRef} options={this.getCountryList()}
                                    value={this.getDefaultCountry()}
                                    onChange={(country) => this.changeCountry(country)}/>
                        </Col>
                        <Col sm={4}>
                            <div className="stats-block">
                                <span className={'block-title'}>New Cases</span>
                                <span className={'block-number'}>{this.getNewCaseCount()}</span>
                            </div>
                        </Col>
                        <Col sm={4}>
                            <div className="stats-block">
                                <span className={'block-title'}>New Recovered</span>
                                <span className={'block-number'}>{this.getNewRecoveredCount()}</span>
                            </div>
                        </Col>
                        <Col sm={4}>
                            <div className="stats-block">
                                <span className={'block-title'}>New Deaths</span>
                                <span className={'block-number'}>{this.getNewDeathCount()}</span>
                            </div>
                        </Col>
                    </Row>
                    <Row>

                        <Col sm={4}>
                            <Col className={'stats-block'}>
                                <span className={'block-title'}>Total Cases</span>
                                <span className={'block-number'}>{this.getCaseCount()}</span>
                            </Col>
                            <Col className={'stats-block'}>
                                <span className={'block-title'}>Total Recovered</span>
                                <span className={'block-number'}>{this.getRecoveredCount()}</span>
                            </Col>
                            <Col className={'stats-block'}>
                                <span className={'block-title'}>Total Deaths</span>
                                <span className={'block-number'}>{this.getDeathCount()}</span>
                            </Col>
                        </Col>
                        <Col sm={8}>
                            <ResponsiveContainer className={'stats-area'} height="100%">
                                <AreaChart
                                    data={this.getChartStats()}
                                    margin={{
                                        top: 30, right: 30, left: 30, bottom: 30,
                                    }}>
                                    <CartesianGrid strokeDasharray="3 3"/>
                                    <XAxis dataKey="Date"/>
                                    <YAxis/>
                                    <Tooltip/>
                                    <Area type="monotone" dataKey="Cases" stroke="#8884d8" fill="#8884d8"/>
                                </AreaChart>
                            </ResponsiveContainer>
                        </Col>
                    </Row>
                </Container>
            </div>
        );
    }
}

export default App;