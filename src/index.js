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
      overlaps: []
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

  generateOverlapData() {

    return this.state.overlaps.map( (overlap) => {

      console.log('overlap', overlap)
      return {
        bid: overlap.bid.price,
        ask: overlap.ask.price,
        bidExchange: overlap.bidExchange,
        askExchange: overlap.askExchange
      }
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
    let overlapData
    
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
    
    try {
      overlapData = this.generateOverlapData()
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
          Precision (Lower precision combines more orders)
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

        
        <div style={{paddingTop: '3em'}}>Combined Bids Order Book {this.state.base}-{this.state.quote}</div>
        <ReactTable
          data={bidsRowsData}
          columns={columnsData}
        />
        <div style={{paddingTop: '3em'}}>Combined Asks Order Book {this.state.base}-{this.state.quote}</div>
        <ReactTable
          data={asksRowsData}
          columns={columnsData}
        />
        <div style={{paddingTop: '3em'}}>Overlapping Bids / Asks (Arbitrage Opportunities) {this.state.base}-{this.state.quote}</div>
        <ReactTable
          data={overlapData}
          columns={[{
            Header: 'Bid Price',
            accessor: 'bid'
          }, {
            Header: 'Ask Price',
            accessor: 'ask'
          }, {
            Header: 'Bid Exchange',
            accessor: 'bidExchange'
          }, {
            Header: 'Ask Exchange',
            accessor: 'askExchange'
          }]}
        />
      </div>
    );
  }
  
  async fetchBookAndSymbols() {
   //    const baseUrl = 'http://54.187.105.135:3001'
   const baseUrl = 'http://localhost:3001'
   const symbols = await fetch(baseUrl + '/symbols').then( (results) => results.json())
   const overlaps = await fetch(baseUrl + '/overlaps').then( (results) => results.json())
   const combinedBookData = await fetch(baseUrl + '/combined?base=' + this.state.base + '&quote=' + this.state.quote + '&precision=' + this.state.precision).then( (results) => results.json())

  return {symbols, combinedBookData, overlaps}
 }
}

// ========================================

ReactDOM.render(
  <CombinedOrderBooks />,
  document.getElementById('root')
);
