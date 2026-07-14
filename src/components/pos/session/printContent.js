import Table from './Table';
import PSummaryTable from './PaymentSummary/Table';
import CashBoxSummary from './cashBoxSummary';

function PrintContent({
  isnet,
  Tdata,
  PSData,
  posId,
  Click,
  setClick,
  CashBoxClick,
  OrderClick,
}) {
  return (
    <>
      <div>
        {/* <br/> */}
        <PSummaryTable PSData={PSData} Click={Click} setClick={setClick} />
        <hr />
        <Table Tdata={Tdata} OrderClick={OrderClick} />
        <hr />
        <CashBoxSummary posId={posId} CashBoxClick={CashBoxClick} />
      </div>
    </>
  );
}

export default PrintContent;
