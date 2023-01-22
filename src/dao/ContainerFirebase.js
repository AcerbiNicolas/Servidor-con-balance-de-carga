const admin = require('firebase-admin');
const serviceAccount = require('../segunda-entrega-d2c67-firebase-adminsdk-3vy4j-84da86b190.json');
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const { getFirestore, doc, getDoc } = require('firebase-admin/firestore');

class Container {
	constructor() {
		this.db = getFirestore();
	}
	//Save an object
	save(obj) {
		try {
			return this.db.collection('products').add(obj);
		} catch (err) {
			console.log(err);
		}
	}
    //Update an object
    update(id, obj) {
		try {
			return this.db.doc(`/products/${id}`).update(obj);
		} catch (err) {
			console.log(err);
		}
	}
	//Get an object by ID
	getById(id) {
		try {
			const data = this.db.doc(`/products/${id}`).get();
			return data;
		} catch (err) {
			console.log(err);
		}
	}
	//Get all objects
	getAll() {
		try {
			return this.db.find();
		} catch (err) {
			console.log(err);
		}
	}
	//Delete one object
	deleteById(id) {
		try {
			return this.db.findByIdAndDelete(id);
		} catch (err) {
			console.log(err);
		}
	}
}

module.exports = Container;