import http from '../http-common';

class PeriodLockService {
    getAll() {
        return http.get('/accountsservice/api/periodLock');
    }

    getByFY(date) {
        return http.get(`/accountsservice/api/periodLock/financialYear${date ? `?date=${date}` : ''}`);
    }

    // data: { financialYear: <fyStartYear>, reason? }
    lock(data) {
        return http.post('/accountsservice/api/periodLock/lock', data);
    }

    unlock(data) {
        return http.post('/accountsservice/api/periodLock/unlock', data);
    }

    getAuditLogs(limit = 50, offset = 0) {
        return http.get(`/accountsservice/api/periodLock/audit?limit=${limit}&offset=${offset}`);
    }

    // Pending close-out items (uncleared cheques + unreconciled payments) for an FY
    getFYSummary(fyStartYear) {
        return http.get(`/accountsservice/api/periodLock/${fyStartYear}/summary`);
    }

    getUnclearedCheques(fyStartYear, limit = 25, offset = 0) {
        return http.get(`/accountsservice/api/periodLock/${fyStartYear}/cheques?limit=${limit}&offset=${offset}`);
    }

    getUnreconciledPayments(fyStartYear, limit = 25, offset = 0) {
        return http.get(`/accountsservice/api/periodLock/${fyStartYear}/unreconciled?limit=${limit}&offset=${offset}`);
    }
}

export default new PeriodLockService();
