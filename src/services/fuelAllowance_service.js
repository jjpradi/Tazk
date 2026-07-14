import http from '../http-common';

class FuelAllowanceService {
  getFuelPrice(data) {
    return http.post(`/fuelAllowance`,data);
  }

  getTravelDetailsAction(data) {
    return http.post(`/fuelAllowance/travelDetails`,data);
  }

  deleteFuelPrice(id) {
    return http.delete(`/fuelAllowance/allowanceById/${id}`);
  }

  getAllowanceList(id) {
    return http.get(`/fuelAllowance/allowanceById/${id}`);
  }

  createFuelPrice(data) {
    return http.post(`/fuelAllowance/createFuelAllowance`, data);
  }

  getSalesManList(data) {
    return http.post(`/fuelAllowance/salesManList`, data);
  }

  searchSalesManList(data) {
    return http.post(`/fuelAllowance/searchSalesManList`,data);
  }
  
  updateFuelPrice(fuelPriceId, data) {
    return http.put(`/fuelAllowance/allowanceById/${fuelPriceId}`, data);
  }

  getFuelTypes() {
    return http.get(`/fuelAllowance/getFuelTypes`);
  }

  getFuelPriceBasedOnType(data) {
    return http.post(`/fuelAllowance/getFuelPriceBasedOnType`,data);
  }

  getSalesmanFuelDetails() {
    return http.get(`/fuelAllowance/getSalesmanFuelDetails`);
  }
}

export default new FuelAllowanceService();
