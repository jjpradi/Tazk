import React from "react";
import DraggableList from "react-draggable-lists";

import "./styles.css";

function DragDashboardList({ getalldashboarddata }){
    return (
      <div className="App">
        <div style={{ width: 300, margin: "0 auto" }}>
          <DraggableList width={300} height={50} >
            {getalldashboarddata.map((item, index) => (
              <li key={index}>{item.dashboard_name}</li>
            ))}
          </DraggableList>
        </div>
      </div>
    );
}

export default DragDashboardList;
