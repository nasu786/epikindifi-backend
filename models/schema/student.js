module.exports = function (mongoose) {
    return mongoose.model('students', new mongoose.Schema(
        {
            studentId: {
                type: Number,
                required: true,
                unique: true
            },
            name: {
                type: String,
                required: true,
            },
            address: {
                type: String,
                required: true,
            },
            class: {
                type: String,
                required: true,
            }
        },
        { timestamps: true }
    ));
};
