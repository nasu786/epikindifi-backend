module.exports = function (mongoose) {
    return mongoose.model('parents', new mongoose.Schema(
        {
            studentId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "student",
                required: true,
            },
            fatherName: {
                type: String,
                required: true,
            },
            motherName: {
                type: String,
                required: true,
            },
            phoneNumber: {
                type: String
            }
        },
        { timestamps: true }
    ));
};
