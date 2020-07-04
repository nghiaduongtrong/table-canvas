import React, { Component } from 'react'
import TableCanvas from './components/TableCanvas'

export default class App extends Component {
  data = [
  ]

  genratorData = () => {for (let i = 0; i <= 5000; i++) {
    this.data.push({
      "id": i,
      "name": "arcu.Morbi@ipsum.ca",
      "phone": "09 96 07 84 25"
    },) 
  }}

  componentDidMount() {
    this.genratorData();
  }
  thead = [
    { lable: "ID", width: 100, target: 'id', onClick: () => {} },
    { lable: "NAME", width: 500, target: 'name', onClick: () => {} },
    { lable: "PHONE", width: 100, target: 'phone' },
  ]
  render() {
    return (
      <div style={{margin: 100}}>
        <TableCanvas
          data={this.data}
          thead={this.thead}
          tableStriped
        />
      </div>
    )
  }
}
