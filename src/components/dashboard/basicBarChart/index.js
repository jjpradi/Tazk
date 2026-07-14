// import React,{Component} from 'react';
// import Chart from 'react-apexcharts'

// class Barchart extends Component {
//     constructor(props) {
//       super(props);

//       this.state = {
//         options: {
//           chart: {
//             id: 'apexchart-example'
//           },
//           xaxis: {
//             title: "Social Network",
//             categories: [1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999]
//           },
//           yaxis: {
//             title: "Social"
//           }
//         },
//         series: [{
//           name: 'series-1',

//           data: [{y :30}, {y :40}, {y :35}, {y :50}, {y :49}, {y :60}, {y :70}, {y :91}, {y :125}]
//         }]
//       }
//     }
//     render() {
//       return (
//         <Chart options={this.state.options} series={this.state.series} type="bar" width={500} height={320} />
//       )
//     }
//   }
//   export default Barchart;

import React from 'react';
import ReactApexChart from 'react-apexcharts';

class ApexChart extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      series: [
        {
          data: [80, 430, 70, 65, 52, 48],
        },
      ],
      options: {
        chart: {
          type: 'bar',
          height: 350,
        },
        plotOptions: {
          bar: {
            borderRadius: 5,
            horizontal: true,
          },
        },
        dataLabels: {
          enabled: false,
        },
        yaxis: {
          title: {
            text: 'Lead Stage',
          },
        },
        title: {
          text: 'All Leads',
        },
        xaxis: {
          categories: [
            'New',
            'Contact..',
            'Interes..',
            'Under r..',
            'Stage1',
            'Stage2',
          ],
          title: {
            text: 'Count Of Leads',
          },
        },
      },
    };
  }

  render() {
    return (
      <div id='chart' sx={{height:'35vh'}}>
        <ReactApexChart
          options={this.state.options}
          series={this.state.series}
          type='bar'
          height={350}
        />
      </div>
    );
  }
}
export default ApexChart;
