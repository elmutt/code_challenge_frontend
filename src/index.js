import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import ReactTable from "react-table";
import 'react-table/react-table.css'
import SelectReact from 'react-select';

class CombinedOrderBooks extends React.Component {
  
  constructor(props) {
    super(props)
    this.state = {
      base: 'BTC',
      quote: 'ETH',
      precision: 4,
    }
  }
  
  async componentDidMount() {
    this.setState(await this.fetchBookAndSymbols())
  }


  generateColumnsData() {
    const columnItems = []
    columnItems.push({Header: "Price", accessor: 'price'})
    this.state.combinedBookData.exchangesIncluded.forEach( (exchange) => {
      columnItems.push({Header: exchange + ' amount', accessor: exchange + '_amount'})
    })
    columnItems.push({Header: '# of orders combined', accessor: 'combined'})
    return columnItems
  }
  
  generateRowsData(type) {
    const rowItems = this.state.combinedBookData[type].map( (order) => {
      const rowItem = {}
      rowItem.price = order.price
      Object.keys(order.exchangeQuantities).forEach( (exchange, index) => {
        rowItem[exchange + '_amount'] = order.exchangeQuantities[exchange]
      })
      rowItem.combined = order.combinedOrderCount
      return rowItem
    })
    return rowItems
  }

  generateQuoteSelectionData() {
    
    return this.state.symbols.map( (symbol) => {
      
      return { value: symbol, label: symbol }
    })
  }
  

  handleBaseChange = async (selectedBaseOption) => {
    this.setState({ base: selectedBaseOption.value });
    this.setState(await this.fetchBookAndSymbols())
  }
  handleQuoteChange = async (selectedQuoteOption) => {
    this.setState({ quote: selectedQuoteOption.value });
    this.setState(await this.fetchBookAndSymbols())
  }
  handlePrecisionChange = async (selectedPrecisionOption) => {
    this.setState({ precision: selectedPrecisionOption.value });
    this.setState(await this.fetchBookAndSymbols())
  }


  render() {
    let columnsData
    let bidsRowsData
    let asksRowsData
    let quoteSelectionOptions
    
    try{
      columnsData = this.generateColumnsData()
    } catch(err){
      columnsData = columnsData || [{
        Header: 'Price',
      }, {
        Header: '',
      }, {
        Header: '',
      }, {
        Header: '',
      }, {
        Header: '',
      }, {
        Header: '',
      }, {
        Header: '# of orders combined'
      }]
    }
    
    try {
      bidsRowsData = this.generateRowsData('bids')
    } catch(err){}
    
    try {
      asksRowsData = this.generateRowsData('asks')
    } catch(err){}

    try {
      quoteSelectionOptions = this.generateQuoteSelectionData()
    }catch(err){}
    
    return (
      <div>

        <div>
          Base Symbol
          <SelectReact
            value={{value: this.state.base, label: this.state.base}}
            onChange={this.handleBaseChange}
            options={[
              { value: 'BTC', label: 'BTC' },
              { value: 'ETH', label: 'ETH' },
            ]}
          />
          Quote Symbol
          <SelectReact
            value={{value: this.state.quote, label: this.state.quote}}
            onChange={this.handleQuoteChange}
            options={quoteSelectionOptions}
          />
          <SelectReact
            value={{value: this.state.precision, label: this.state.precision+' Decimals'}}
            onChange={this.handlePrecisionChange}
            options={[
              { value: 2, label: '2 Decimals' },
              { value: 3, label: '3 Decimals' },
              { value: 4, label: '4 Decimals' },
              { value: 5, label: '5 Decimals' },
              { value: 6, label: '6 Decimals' },
              { value: 7, label: '7 Decimals' },
              { value: 8, label: '8 Decimals' },
            ]}
          />

          
        </div>

        
        <div>Combined Bids Order Book {this.state.base}-{this.state.quote}</div>
        <ReactTable
          data={bidsRowsData}
          columns={columnsData}
        />
        <div>Combined Asks Order Book {this.state.base}-{this.state.quote}</div>
        <ReactTable
          data={asksRowsData}
          columns={columnsData}
        />
        
      </div>
    );
  }
  
  async fetchBookAndSymbols() {
   //    const baseUrl = 'http://54.187.105.135:3001'
   const baseUrl = 'http://localhost:3001'
   const symbols = await fetch(baseUrl + '/symbols').then( (results) => results.json())
   const combinedBookData = await fetch(baseUrl + '/combined?base=' + this.state.base + '&quote=' + this.state.quote + '&precision=' + this.state.precision).then( (results) => results.json())

   console.log('combinedBookData', combinedBookData)

  return {symbols, combinedBookData}
 }
}

// ========================================

ReactDOM.render(
  <CombinedOrderBooks />,
  document.getElementById('root')
);
