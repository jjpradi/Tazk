import { Grid } from "@mui/material";
import moment from "moment";
import PropTypes from "prop-types";

const s = {
  textCenter: { textAlign: 'center' },
  textRight: { textAlign: 'right' },
  textLeft: { textAlign: 'left' },
  fontSize12: { fontSize: '12px' },
  fontWeight600: { fontWeight: 600 },
  tableCellPadding: { padding: 6 },
  borderCollapse: { borderCollapse: 'collapse', width: '100%' },
  subTotalColor: { backgroundColor: '#e6e6e9' },
  tableHeadColor: { backgroundColor: '#C7C8CC' },
  textColorBlack: { color: 'black' },
  paddingTop: { paddingTop: '2%' },
  marginBottom: { marginBottom: '1.5%' },
  marginTop: { marginTop: '1.7%' },
  tableMarginTop: { marginTop: 25 },
  productTable: { minHeight: '550px', width: '100%' },
  paddingLeft: { paddingLeft: '10%' },
  addressMinHeight: { minHeight: '90px' },
};

const merge = (...objs) => Object.assign({}, ...objs);

// Pre-computed combined styles
const tableHeadCellStyle = merge(s.textCenter, s.tableHeadColor, s.tableCellPadding, s.fontWeight600);
const tableCellStyle = merge(s.textCenter, s.tableCellPadding);

const date = new Date()
const currentDate = moment(date).format('DD/MM/YYYY')
function QuotationTemp(props){

  const { data, company } = props
  console.log(data, 'rhheufefuyefuiu')

  const styles = s

  const calculateSubTotal = () => {
    let subTotal = 0
    data.products.map((product) => subTotal = subTotal + parseInt(product.productTotal))
    return subTotal
  }

  const numberToWords = () => {

    const num = calculateSubTotal()

    const a = [
      '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve',
      'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
    ];
    const b = [
      '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
    ];

    const numberToWordsHelper = (n) => {
      if (n < 20) return a[n];
      if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : '');
      if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + numberToWordsHelper(n % 100) : '');
      if (n < 1000000) return numberToWordsHelper(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 !== 0 ? ' ' + numberToWordsHelper(n % 1000) : '');
      return numberToWordsHelper(Math.floor(n / 1000000)) + ' Million' + (n % 1000000 !== 0 ? ' ' + numberToWordsHelper(n % 1000000) : '');
    };

    return numberToWordsHelper(num);
  };

  return (
    <html lang="en">
      <div style={merge(styles.textColorBlack, styles.fontSize12)}>
        <Grid container>
          {/* Company Name and Bill To */}
          <Grid
            size={{
              lg: 7,
              md: 7,
              sm: 7,
              xs: 7
            }}>
            <Grid container>
              {/* Company Name and Logo */}
              <Grid
                size={{
                  lg: 12,
                  md: 12,
                  sm: 12,
                  xs: 12
                }}>
                <Grid container>
                  {/* Company Logo */}
                  <Grid
                    size={{
                      lg: 3,
                      md: 3,
                      sm: 3,
                      xs: 3
                    }}>
                    <img src={company.company_logo || ''} alt='Company Logo' width='65%'/>
                  </Grid>

                  {/* Company Name and Address */}
                  <Grid
                    sx={merge(styles.paddingTop, styles.addressMinHeight)}
                    size={{
                      lg: 9,
                      md: 9,
                      sm: 9,
                      xs: 9
                    }}>
                    <div><b>{company.companyName}</b></div>
                    <div>{company.fullAddress} - {company.pincode}</div>
                  </Grid>
                </Grid>
              </Grid>

              {/* Bill To */}
              <Grid
                sx={merge(styles.marginTop, styles.paddingLeft, styles.addressMinHeight)}
                size={{
                  lg: 12,
                  md: 12,
                  sm: 12,
                  xs: 12
                }}>
                <div>
                  <b>
                    Bill To
                  </b>
                </div>

                <div>
                  {data.customerFullName}
                </div>

                {
                  data.customerAddress ? (
                    <>
                      <div>
                        {data.customerAddress}
                        {data.customerArea ? `, ${data.customerArea}` : ''}
                      </div>

                      <div>
                        {data.customerCity}, {data.customerState} - {data.customerPincode}
                      </div>
                    </>
                  ) : null
                }
              </Grid>

              <Grid
                sx={merge(styles.marginBottom, styles.paddingLeft, {marginTop: 4})}
                size={{
                  lg: 12,
                  md: 12,
                  sm: 12,
                  xs: 12
                }}>
                <Grid container>
                  <Grid
                    size={{
                      lg: 3,
                      md: 3,
                      sm: 3,
                      xs: 3
                    }}>
                    <div><b>Ref</b></div>
                  </Grid>
                  <Grid
                    size={{
                      lg: 1,
                      md: 1,
                      sm: 1,
                      xs: 1
                    }}>
                    <div>:</div>
                  </Grid>
                  <Grid
                    ld={8}
                    size={{
                      md: 8,
                      sm: 8,
                      xs: 8
                    }}>
                    <div>{data.reference}</div>
                  </Grid>
                </Grid>
              </Grid>

              <Grid
                sx={styles.paddingLeft}
                size={{
                  lg: 12,
                  md: 12,
                  sm: 12,
                  xs: 12
                }}>
                <Grid container>
                  <Grid
                    size={{
                      lg: 3,
                      md: 3,
                      sm: 3,
                      xs: 3
                    }}>
                    <div><b>Subject</b></div>
                  </Grid>

                  <Grid
                    size={{
                      lg: 1,
                      md: 1,
                      sm: 1,
                      xs: 1
                    }}>
                    <div>:</div>
                  </Grid>
                  
                  <Grid
                    ld={8}
                    size={{
                      md: 8,
                      sm: 8,
                      xs: 8
                    }}>
                    <div>{data.quotation_for}</div>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>

          {/* Quotation Details */}
          <Grid
            size={{
              lg: 5,
              md: 5,
              sm: 5,
              xs: 5
            }}>
            <Grid container>
              <Grid
                sx={styles.marginBottom}
                size={{
                  lg: 12,
                  md: 12,
                  sm: 12,
                  xs: 12
                }}>
                <Grid container>
                  <Grid
                    size={{
                      lg: 4,
                      md: 4,
                      sm: 4,
                      xs: 4
                    }}>
                    <div><b>Quote No</b></div>
                  </Grid>

                  <Grid
                    size={{
                      lg: 1,
                      md: 1,
                      sm: 1,
                      xs: 1
                    }}>
                    <div>:</div>
                  </Grid>
                  
                  <Grid
                    ld={7}
                    size={{
                      md: 7,
                      sm: 7,
                      xs: 7
                    }}>
                    <div>{data.quotation_number}</div>
                  </Grid>
                </Grid>
              </Grid>

              <Grid
                sx={styles.marginBottom}
                size={{
                  lg: 12,
                  md: 12,
                  sm: 12,
                  xs: 12
                }}>
                <Grid container>
                  <Grid
                    size={{
                      lg: 4,
                      md: 4,
                      sm: 4,
                      xs: 4
                    }}>
                    <div><b>Created Date</b></div>
                  </Grid>

                  <Grid
                    size={{
                      lg: 1,
                      md: 1,
                      sm: 1,
                      xs: 1
                    }}>
                    <div>:</div>
                  </Grid>
                  
                  <Grid
                    ld={7}
                    size={{
                      md: 7,
                      sm: 7,
                      xs: 7
                    }}>
                    <div>{moment(data.quotation_date).format('DD/MM/YYYY')}</div>
                  </Grid>
                </Grid>
              </Grid>

              <Grid
                sx={styles.marginBottom}
                size={{
                  lg: 12,
                  md: 12,
                  sm: 12,
                  xs: 12
                }}>
                <Grid container>
                  <Grid
                    size={{
                      lg: 4,
                      md: 4,
                      sm: 4,
                      xs: 4
                    }}>
                    <div><b>Expiry</b></div>
                  </Grid>

                  <Grid
                    size={{
                      lg: 1,
                      md: 1,
                      sm: 1,
                      xs: 1
                    }}>
                    <div>:</div>
                  </Grid>
                  
                  <Grid
                    ld={7}
                    size={{
                      md: 7,
                      sm: 7,
                      xs: 7
                    }}>
                    <div>{data.expiry}</div>
                  </Grid>
                </Grid>
              </Grid>

              <Grid
                sx={styles.marginBottom}
                size={{
                  lg: 12,
                  md: 12,
                  sm: 12,
                  xs: 12
                }}>
                <Grid container>
                  <Grid
                    size={{
                      lg: 4,
                      md: 4,
                      sm: 4,
                      xs: 4
                    }}>
                    <div><b>Payment Terms</b></div>
                  </Grid>

                  <Grid
                    size={{
                      lg: 1,
                      md: 1,
                      sm: 1,
                      xs: 1
                    }}>
                    <div>:</div>
                  </Grid>
                  
                  <Grid
                    ld={7}
                    size={{
                      md: 7,
                      sm: 7,
                      xs: 7
                    }}>
                    <div>{data.payment_terms}</div>
                  </Grid>
                </Grid>
              </Grid>

              <Grid
                sx={styles.marginBottom}
                size={{
                  lg: 12,
                  md: 12,
                  sm: 12,
                  xs: 12
                }}>
                <Grid container>
                  <Grid
                    size={{
                      lg: 4,
                      md: 4,
                      sm: 4,
                      xs: 4
                    }}>
                    <div><b>Delivery Terms</b></div>
                  </Grid>

                  <Grid
                    size={{
                      lg: 1,
                      md: 1,
                      sm: 1,
                      xs: 1
                    }}>
                    <div>:</div>
                  </Grid>
                  
                  <Grid
                    ld={7}
                    size={{
                      md: 7,
                      sm: 7,
                      xs: 7
                    }}>
                    <div>{data.delivery_terms}</div>
                  </Grid>
                </Grid>
              </Grid>

              <Grid
                sx={merge(styles.marginBottom, styles.marginTop)}
                size={{
                  lg: 12,
                  md: 12,
                  sm: 12,
                  xs: 12
                }}>
                <Grid container>
                  <Grid
                    size={{
                      lg: 4,
                      md: 4,
                      sm: 4,
                      xs: 4
                    }}>
                    <div><b>Created By</b></div>
                  </Grid>

                  <Grid
                    size={{
                      lg: 1,
                      md: 1,
                      sm: 1,
                      xs: 1
                    }}>
                    <div>:</div>
                  </Grid>
                  
                  <Grid
                    ld={7}
                    size={{
                      md: 7,
                      sm: 7,
                      xs: 7
                    }}>
                    <div>{data.createdByFullName}</div>
                  </Grid>
                </Grid>
              </Grid>

              <Grid
                sx={styles.marginBottom}
                size={{
                  lg: 12,
                  md: 12,
                  sm: 12,
                  xs: 12
                }}>
                <Grid container>
                  <Grid
                    size={{
                      lg: 4,
                      md: 4,
                      sm: 4,
                      xs: 4
                    }}>
                    <div><b>Contact</b></div>
                  </Grid>

                  <Grid
                    size={{
                      lg: 1,
                      md: 1,
                      sm: 1,
                      xs: 1
                    }}>
                    <div>:</div>
                  </Grid>
                  
                  <Grid
                    ld={7}
                    size={{
                      md: 7,
                      sm: 7,
                      xs: 7
                    }}>
                    <div>{data.contactPersonFullName}</div>
                  </Grid>
                </Grid>
              </Grid>

              <Grid
                sx={styles.marginBottom}
                size={{
                  lg: 12,
                  md: 12,
                  sm: 12,
                  xs: 12
                }}>
                <Grid container>
                  <Grid
                    size={{
                      lg: 4,
                      md: 4,
                      sm: 4,
                      xs: 4
                    }}>
                    <div><b>Phone</b></div>
                  </Grid>

                  <Grid
                    size={{
                      lg: 1,
                      md: 1,
                      sm: 1,
                      xs: 1
                    }}>
                    <div>:</div>
                  </Grid>
                  
                  <Grid
                    ld={7}
                    size={{
                      md: 7,
                      sm: 7,
                      xs: 7
                    }}>
                    <div>{data.contactPersonPhoneNumber}</div>
                  </Grid>
                </Grid>
              </Grid>

              <Grid
                sx={styles.marginBottom}
                size={{
                  lg: 12,
                  md: 12,
                  sm: 12,
                  xs: 12
                }}>
                <Grid container>
                  <Grid
                    size={{
                      lg: 4,
                      md: 4,
                      sm: 4,
                      xs: 4
                    }}>
                    <div><b>Email</b></div>
                  </Grid>

                  <Grid
                    size={{
                      lg: 1,
                      md: 1,
                      sm: 1,
                      xs: 1
                    }}>
                    <div>:</div>
                  </Grid>
                  
                  <Grid
                    ld={7}
                    size={{
                      md: 7,
                      sm: 7,
                      xs: 7
                    }}>
                    <div>{data.contactPersonEmail}</div>
                  </Grid>
                </Grid>
              </Grid>

              <Grid
                sx={styles.marginTop}
                size={{
                  lg: 12,
                  md: 12,
                  sm: 12,
                  xs: 12
                }}>
                <Grid container>
                  <Grid
                    size={{
                      lg: 4,
                      md: 4,
                      sm: 4,
                      xs: 4
                    }}>
                    <div><b>Approved By</b></div>
                  </Grid>

                  <Grid
                    size={{
                      lg: 1,
                      md: 1,
                      sm: 1,
                      xs: 1
                    }}>
                    <div>:</div>
                  </Grid>
                  
                  <Grid
                    ld={7}
                    size={{
                      md: 7,
                      sm: 7,
                      xs: 7
                    }}>
                    <div>Approved By Val</div>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>

          {/* Product Table */}
          <Grid
            sx={styles.productTable}
            size={{
              lg: 12,
              md: 12,
              sm: 12,
              xs: 12
            }}>
            <table style={merge(styles.borderCollapse, styles.tableMarginTop)}>

              <colgroup>
                <col span="1" style={{width: "5%"}}/>
                <col span="1" style={{width: "14%"}}/>
                <col span="1" style={{width: "25%"}}/>
                <col span="1" style={{width: "8%"}}/>
                <col span="1" style={{width: "12%"}}/>
                <col span="1" style={{width: "12%"}}/>
                <col span="1" style={{width: "12%"}}/>
                <col span="1" style={{width: "12%"}}/>
              </colgroup>

              <tr>
                <td style={tableHeadCellStyle}>S.No</td>
                <td style={tableHeadCellStyle}>Product</td>
                <td style={tableHeadCellStyle}>Description</td>
                <td style={tableHeadCellStyle}>Qty</td>
                <td style={tableHeadCellStyle}>Price</td>
                <td style={tableHeadCellStyle}>Discount Type</td>
                <td style={tableHeadCellStyle}>Discount</td>
                <td style={tableHeadCellStyle}>Net Price</td>
                <td style={tableHeadCellStyle}>Total</td>
              </tr>

              {
                data.products.map((product, index) => (
                  <tr key={product.productId}>
                    <td style={tableCellStyle}>{index + 1}</td>
                    <td style={tableCellStyle}>{product.product}</td>
                    <td style={tableCellStyle}>{product.description}</td>
                    <td style={tableCellStyle}>{product.quantity}</td>
                    <td style={tableCellStyle}>{product.price}</td>
                    <td style={tableCellStyle}>{product.discountType}</td>
                    <td style={tableCellStyle}>{product.discountType === 'percent' ? `${product.discount}%` : product.discount}</td>
                    <td style={tableCellStyle}>{product.netPrice}</td>
                    <td style={tableCellStyle}>{product.productTotal}</td>
                  </tr>
                ))
              }
            </table>
          </Grid>

          {/* Sub-Total */}
          <Grid
            size={{
              lg: 12,
              md: 12,
              sm: 12,
              xs: 12
            }}>
            <Grid container>
              {/* Empty Grid */}
              <Grid
                size={{
                  lg: 9,
                  md: 9,
                  sm: 9,
                  xs: 9
                }}></Grid>

              {/* Sub-Total */}
              <Grid
                size={{
                  lg: 3,
                  md: 3,
                  sm: 3,
                  xs: 3
                }}>
                <Grid container>
                  <Grid
                    sx={merge(styles.textCenter, styles.tableCellPadding, styles.subTotalColor)}
                    size={{
                      lg: 6,
                      md: 6,
                      sm: 6,
                      xs: 6
                    }}>
                    <div><b>Sub Total</b></div>
                  </Grid>
                  
                  <Grid
                    ld={6}
                    sx={merge(styles.textRight, styles.tableCellPadding, styles.subTotalColor)}
                    size={{
                      md: 6,
                      sm: 6,
                      xs: 6
                    }}>
                    <div>{`${calculateSubTotal()}/-`}</div>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>

          {/* Amount in Words */}
          <Grid
            sx={merge(styles.tableMarginTop, {paddingLeft: '3%'})}
            size={{
              lg: 12,
              md: 12,
              sm: 12,
              xs: 12
            }}>
            <div>
              <b>Amount in Words &nbsp; :</b> &nbsp; &nbsp; &nbsp; {`${numberToWords()} Only`}
            </div>
          </Grid>

          {/* Terms */}
          <Grid
            sx={merge(styles.tableMarginTop, {paddingLeft: '3%'})}
            size={{
              lg: 12,
              md: 12,
              sm: 12,
              xs: 12
            }}>
            <div>
              <b>Terms</b>
            </div>

            <div style={{minHeight: '100px', fontSize: '11px'}}>{data.terms}</div>
          </Grid>

          {/* Accepted By, Title, Date */}
          <Grid
            sx={merge(styles.tableMarginTop, styles.paddingLeft)}
            size={{
              lg: 12,
              md: 12,
              sm: 12,
              xs: 12
            }}>
            <Grid container>
              <Grid
                size={{
                  lg: 4,
                  md: 4,
                  sm: 4,
                  xs: 4
                }}>
                {/* Accepted By */}
                <div><b>Accepted By&nbsp; : &nbsp;</b> {''}</div>
              </Grid>

              <Grid
                size={{
                  lg: 4,
                  md: 4,
                  sm: 4,
                  xs: 4
                }}>
                {/* Title */}
                <div><b>Title &nbsp; : &nbsp;</b> {''}</div>
              </Grid>

              <Grid
                size={{
                  lg: 4,
                  md: 4,
                  sm: 4,
                  xs: 4
                }}>
                {/* Date */}
                <div><b>Date &nbsp; : &nbsp;</b> {currentDate}</div>
              </Grid>
            </Grid>
          </Grid>

        </Grid>
      </div>
    </html>
  );

}

QuotationTemp.propTypes = {
  data: PropTypes.object,
  company: PropTypes.object
}

export default QuotationTemp