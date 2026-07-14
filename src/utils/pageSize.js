import { commonDateFormat } from "./getTimeFormat"

export const pageSize = 20
export const dasboardPageSize = 5
export const maxBodyHeight = 'calc(100vh - 210px)'
export const tabHeight = 'calc(100vh - 275px)'
export const maxHeight = 'calc(100vh - 95px)'
export const headerStyle = {
    fontSize: 12,
    fontWeight:700,
    whiteSpace: 'nowrap',
  }
export const vendorHeaderStyle = {
    fontSize: 12,
    fontWeight:700,
    backgroundColor: '#F4F7FE',
  }
export const cellStyle = {
    fontSize: 12,
  fontWeight: 400,
  padding: '4px 16px',
}

export const chartcellStyle = {
  fontSize: 11,
fontWeight: 400,
// paddingLeft: '20px',
//   paddingRight: '20px',
}
export const pos_btn = {
  fontSize: 10,
  fontWeight: 600,
  }

export const font14_500 = {
  fontSize: 14,
    fontWeight:500,
}


export const common_paddingB = {
  paddingBottom:'5px'
}

// Define a custom function to format time in 12-hour format
export const formatTime12Hour = (time) => {
  if (!time) {
    return '-';
  }
  const timeParts = time?.split(':');
  let hours = parseInt(timeParts[0], 10);
  const minutes = timeParts[1];
  const ampm = hours >= 12 ? 'PM' : 'AM';

  if (hours > 12) {
    hours -= 12;
  } else if (hours === 0) {
    hours = 12;
  }

  return `${hours}:${minutes} ${ampm}`;
};


export const formatDate12Hr = (time) => {
  const timeParts = time?.split(' ');
  const datePart = timeParts[0];
  const timePart = timeParts[1];
  const timePartsNumeric = timePart?.split(':');
  let hours = parseInt(timePartsNumeric[0], 10);
  const minutes = timePartsNumeric[1];
  const ampm = hours >= 12 ? 'PM' : 'AM';

  if (hours > 12) {
    hours -= 12;
  } else if (hours === 0) {
    hours = 12;
  }

  return `${datePart} ${hours}:${minutes} ${ampm}`;
};

export const formatDate12Hr1 = (time) => {
  const timeParts = time?.split(' ');
  const datePart = timeParts[0];
  const timePart = timeParts[1];
  const timePartsNumeric = timePart?.split(':');
  let hours = parseInt(timePartsNumeric[0], 10);
  const minutes = timePartsNumeric[1];
  const ampm = hours >= 12 ? 'PM' : 'AM';

  if (hours > 12) {
    hours -= 12;
  } else if (hours === 0) {
    hours = 12;
  }

  return `${hours}:${minutes} ${ampm}`; //${commonDateFormat(datePart)}
};

//12hrs time format and dd/mm/yyyy format
export const formatdateandtime = (datetime) => {
  if (!datetime) return '-';
  const [datePart, timePart] = datetime.split(' ');
  if (!datePart || !timePart) return '-';
  const [year, month, day] = datePart.split('-');
  const formattedDate = `${day}/${month}/${year}`;
  const [hours24, minutes] = timePart.split(':');
  let hours = parseInt(hours24, 10);
  const ampm = hours >= 12 ? 'PM' : 'AM';

  if (hours > 12) {
    hours -= 12;
  } else if (hours === 0) {
    hours = 12;
  }

  return `${formattedDate} ${hours}:${minutes} ${ampm}`;
};


export const Time12Hr = (time) => {
  if (!time) return '-';

  let dateObj;

  if (time.includes('T')) {
    dateObj = new Date(time);
  } 
  else if (time.includes(' ')) {
    dateObj = new Date(time.replace(' ', 'T'));
  } 
  else if (time.includes(':')) {
    const today = new Date().toISOString().split('T')[0];
    dateObj = new Date(`${today}T${time}`);
  } 
  else {
    return '-';
  }

  if (isNaN(dateObj)) return '-';

  let hours = dateObj.getHours();
  const minutes = String(dateObj.getMinutes()).padStart(2, '0');

  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;

  return `${hours}:${minutes} ${ampm}`;
};

export function Width(col_name){
    
  const width = {
      'invoice number' : 130,
      'payment mode' : 120,
      'date' : 90,
      'gst number' : 200,
      'location name': 180,
      'product brand' : 150,
      'sale quantity': 110,
      'tax category' : 110,
      'brand' : 100,
      'time and date' : 110,
      'quantity' : 100,
      'name':170,
      'status' : 80
     
  }
  
  if(!width[col_name]){
      return 200
  }
  return width[col_name]
}



export const Duration = (time) => {
  if (!time) {
    return "0h 0m";
  }

  const isNegative = time.startsWith('-');
  const timeParts = time.replace('-', '').split(':');
  const hours = parseInt(timeParts[0], 10);
  const minutes = parseInt(timeParts[1], 10);

  const formattedHours = hours > 0 ? `${hours}h ` : '';
  const formattedMinutes = minutes > 0 ? `${minutes}m` : '';

  if (isNegative) {
    return '-' + (formattedHours + formattedMinutes);
  }

  return formattedHours + formattedMinutes;
};



