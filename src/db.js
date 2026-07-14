import PouchDB from 'pouchdb';
import {v4 as uuidv4} from 'uuid';
export default class DB {
  
  constructor(db_name) {
    this.state = {
      product_lists: {tab0: []},
      product: [],
    };

    this.db = new PouchDB(db_name);
  }
  
  // getAllCheckouts = async () => {
  //     this.db.allDocs({
  //         include_docs: true,
  //         attachments: true
  //       }).then(function (result) {
  //         return result.rows;
  //       }).catch(function (err) {
  //     });
  // }
  
  dbDestroy = () => {
  
    this.db.destroy();
  
  };
  getAllCheckouts = async (id) => {
    try {
      const getData = await this.db.get(`pos_${id}`);
      return getData.pos_session;
    } catch (err) {
      //ee
    }
  };

  getAllOfflineApi = async (id) => {
    try {
      const getData = await this.db.get(`offline_${id}`);
      return getData.pos_session;
    } catch (err) {
      //ee
    }
  };

  deleteOfflineApi = async (id, data = []) => {
    try {
      const doc = await this.db.get(`offline_${id}`);
      await this.db.put({
        _id: `offline_${id}`,
        _rev: doc._rev,
        pos_session: data,
      });
    } catch (err) {
      //ee
    }
  };

  createCheckouts = async (data, id) => {
    try {
      const doc = await this.db.get(`pos_${id}`);
      await this.db.put({
        _id: `pos_${id}`,
        _rev: doc._rev,
        pos_session: data,
      });
    } catch (err) {
      if (err.name === 'not_found') {
        try {
          await this.db.put({
            _id: `pos_${id}`,
            pos_session: data,
          });
        } catch (err) {
          //ee
        }
      }
    }
  };

  offlineApi = async (data, id) => {
    try {
      const doc = await this.db.get(`offline_${id}`);
      const arr = [...doc.pos_session, {id: uuidv4(), ...data}];
      await this.db.put({
        _id: `offline_${id}`,
        _rev: doc._rev,
        pos_session: arr,
      });
    } catch (err) {
      if (err.name === 'not_found') {
        try {
          await this.db.put({
            _id: `offline_${id}`,
            pos_session: [{id: uuidv4(), ...data}],
          });
        } catch (err) {
          //ee
        }
      }
    }
  };

  createProducts = async (data) => {
    // this.db.post({ products: data });
    try {
      const doc = await this.db.get(`product`);
      await this.db.put({
        _id: `product`,
        _rev: doc._rev,
        product_data: data,
      });
    } catch (err) {
      if (err.name === 'not_found') {
        try {
          await this.db.put({
            _id: `product`,
            product_data: data,
          });
        } catch (err) {
          //ee
        }
      }
    }
  };

  getAllProducts = async () => {
    // this.db.allDocs({
    //     include_docs: true,
    //     attachments: true
    //   }).then(function (result) {
    //     return result;
    //   }).catch(function (err) {
    // });
    try {
      const getData = await this.db.get(`product`);
      return getData.product_data;
    } catch (err) {
      //ee
    }
  };
}
