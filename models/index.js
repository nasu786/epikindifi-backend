const { mongoose } = require('mongoose');
const { connectDB } = require('./connection');

connectDB();

module.exports = {
    StudentsModal: require('./schema/student')(mongoose),
    ParentsModal: require('./schema/parent')(mongoose),
}
