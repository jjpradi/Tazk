import React, {useState, useEffect, useRef} from 'react';
import MaterialTable from 'utils/SafeMaterialTable';
import {ExportCsv, ExportPdf} from '@material-table/exporters';

export default function Gsttable(props) {
  const [gst_state, setgst_state] = useState(true);
  const [uniqueData, setuniqueData] = useState([]);
  const tempedit = useRef(null);
  const tempsupplier = useRef(null);
  // console.log(props.app_config_data,'props.app_config_data')
  const taxes = (tax_rate, tax_category) => {
    let total = 0;
    for (let data of props.itemsData) {
      let arr = [];
      if (data?.taxes?.length) {
        if (data.taxes[0].tax_category === tax_category) {
          for (let d in data) {
            if (['item_cost_price', 'quantity'].includes(d)) {
              arr.push(Number(data[d]));
            }
          }
          total += ((arr[0] * arr[1]) / 100) * tax_rate;
        }
      }
    }
    return total ? total.toFixed(2) : 0;
  };

  const custData = () => {
    const filterCol = [
      {tax_des: 'CGST'},
      {tax_des: 'SGST'},
      {tax_des: 'Amount'},
    ];
    let count = 0;

    for (let data of uniqueData) {
      for (let d of data) {
        if (d.tax_group === 'CGST' && d.tax_code === "INTRA") {
          filterCol[0][`tax${count}`] = taxes(d.tax_rate, d.tax_category);
        }
        if (d.tax_group === 'SGST') {
          filterCol[1][`tax${count}`] = taxes(d.tax_rate, d.tax_category);
        }
        if (d.tax_group === 'IGST') {
          filterCol[2][`tax${count}`] = taxes(d.tax_rate, d.tax_category);
        }
      }
      count += 1;
    }
    return filterCol;
  };

  const igstData = () => {
    const filterCol = [{tax_des: 'IGST'}, {tax_des: 'Amount'}];
    let count = 0;

    for (let data of uniqueData) {
      for (let d of data) {
        if (d.tax_group === 'IGST') {
          filterCol[0][`tax${count}`] = taxes(d.tax_rate, d.tax_category);
          filterCol[1][`tax${count}`] = taxes(d.tax_rate, d.tax_category);
        }
      }
      count += 1;
    }
    return filterCol;
  };

  const edit = () => {
    if (!props.itemsData) {
      return;
    }
    const getData = props.itemsData.map((d) => d?.taxes ?? []);
    const validData = getData.filter((a) => a && a.length > 0);
    if (validData.length === 0) {
      return;
    }
    const uniqueAddresses = Array.from(
      new Set(validData.map((a) => a[0]?.tax_category))
    ).map((name) => {
      return validData.find((a) => a[0]?.tax_category === name);
    });
    setuniqueData(uniqueAddresses);
  };
  tempedit.current = edit;
  useEffect(() => {
    tempedit.current();
  }, [props.itemsData]);

  const supplier = () => {
    if (props.supplier_id) {
      const getfil =
        props.vendor.find((d) => d.supplier_id === props.supplier_id) || {};
      const getState =
        props.app_config_data?.find((d) => d.key_name === 'address.state') || {};
      let getfilval = false;
      if (getfil.state?.toLowerCase() === getState.value?.toLowerCase()) {
        getfilval = true;
      }
      setgst_state(getfilval);
      props.setsuppliers(getfilval);
    }
  };
  tempsupplier.current = supplier;
  useEffect(() => {
    tempsupplier.current();
  }, [props.supplier_id, props.vendor]);

  return (
    <>
      <MaterialTable
        options={{
          headerStyle: {
            fontSize: 15
          },
          showTitle: false,
          paging: false,
          toolbar: false,
          exportButton: true,
          exportMenu: [
            {
              label: 'Export PDF',
              exportFunc: (cols, datas) => ExportPdf(cols, datas, 'GstTable'),
            },
            {
              label: 'Export CSV',
              exportFunc: (cols, datas) => ExportCsv(cols, datas, 'GstTable'),
            },
          ],
        }}
        columns={[
          {title: '', field: 'tax_des'},
          ...uniqueData?.map((d, i) => {
            const obj = {};
            if (gst_state) {
              d.forEach((t) => {
                if (t.tax_group === 'CGST' && t.tax_code === "INTRA") { 
                  obj.title = `${t.tax_rate * 2} %`;
                  obj.field = `tax${i}`;
                }
              });
            } else {
              d.forEach((t) => {
                if (t.tax_group === 'IGST' && t.tax_code === "INTER") { 
                  obj.title = `${t.tax_rate} %`;
                  obj.field = `tax${i}`;
                }
              });
            }
            return obj;
          }),
        ]}
        data={gst_state ? custData() : igstData()}
      />
    </>
  );
}

