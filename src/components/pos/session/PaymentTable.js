import React, {useState, useEffect, useRef} from 'react';
import MaterialTable from 'utils/SafeMaterialTable';
import {ExportCsv, ExportPdf} from '@material-table/exporters';

export default function Gsttable({sales_payment}) {
  const [Tdata, setTdata] = useState([]);
  const tempsale = useRef(null);

  const rupees = (x) => {
    x = x.toString();
    let lastThree = x.substring(x.length - 3);
    const otherNumbers = x.substring(0, x.length - 3);
    if (otherNumbers !== '') lastThree = ',' + lastThree;
    const res = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;
    return res;
  };

  const sale = () => {
    const arr = sales_payment.map((d) => {
      const get = {...d};
      for (let key in get) {
        if (['due', 'payment_amount', 'cash_adjustment'].includes(key)) {
          get[key] = get[key] !== '0.00' ? rupees(get[key]) : '0.00';
        }
      }
      return get;
    });
    setTdata(arr);
  };
  tempsale.current = sale;
  useEffect(() => {
    tempsale.current();
  }, []);

  return (
    <>
      <MaterialTable
        options={{
          headerStyle: {
            fontSize: 15
          },
          showTitle: false,
          toolbar: false,
          paging: Tdata.length > 4 ? true : false,
          pageSize: 20,
          pageSizeOptions: [20, 50, 100],
          exportButton: true,
          exportMenu: [
            {
              label: 'Export PDF',
              exportFunc: (cols, datas) =>
                ExportPdf(cols, datas, 'PaymentTable'),
            },
            {
              label: 'Export CSV',
              exportFunc: (cols, datas) =>
                ExportCsv(cols, datas, 'PaymentTable'),
            },
          ],
        }}
        columns={[
          {
            field: 'due',
            title: 'Due',
          },
          {
            field: 'payment_amount',
            title: 'Tendered',
          },
          {
            field: 'cash_adjustment',
            title: 'Change',
          },
          {
            field: 'payment_type',
            title: 'Method',
          },
        ]}
        data={Tdata}
      />
    </>
  );
}

