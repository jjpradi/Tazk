import {useCustomFetch} from 'utils/useCustomFetch';
import http from '../http-common';

export default function ({children, objectName, fileName, style}) {

  const handleDownload = async () => {
    const url = '/posMessage/downloadFile';
    const body = {objectName};
    const config = {
      responseType: 'blob',
    };

    const res = await http.post(url, body, config);

    const data = new Blob([res.data]);
    const fileUrl = URL.createObjectURL(data);
    const a = document.createElement('a');
    a.href = fileUrl;
    a.download = fileName;
    a.style = 'none';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(fileUrl);
  };
  return (
    <div style={style} onClick={handleDownload}>
      {children}
    </div>
  );
}
