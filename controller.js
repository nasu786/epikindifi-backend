const { StudentsModal, ParentsModal } = require("./models")

class Controller {

    feedData = async (req, res) => {
        const classes = ["6A", "6B", "7A", "7B", "8A", "8B", "9A", "9B", "10A", "10B"];
        const cities = ["Chennai", "Bangalore", "Hyderabad", "Mumbai", "Delhi", "Pune"];

        const firstNames = [
            "Rahul", "Arjun", "Vikram", "Kiran", "Sanjay", "Amit", "Rohan", "Siva",
            "Karthik", "Praveen", "Manoj", "Vijay", "Deepak", "Rakesh", "Naveen",
            "Hari", "Roshan", "Surya", "Bala", "Gokul",
            "Priya", "Anitha", "Kavya", "Swathi", "Divya", "Shalini", "Meera", "Harini",
            "Lakshmi", "Sandhya", "Sowmya", "Aishwarya"
        ];

        const lastNames = [
            "Kumar", "Reddy", "Iyer", "Naidu", "Shetty", "Gupta", "Sharma", "Menon",
            "Patel", "Verma", "Joshi", "Mishra", "Rao", "Nair", "Chowdhury"
        ];

        const fatherNames = [
            "Kumar", "Suresh", "Rajesh", "Arun", "Mahesh", "Venkatesh", "Raghavan",
            "Narayanan", "Prakash", "Manikandan", "Senthil", "Sridhar", "Vijayan",
            "Mohan", "Sathish", "Balaji", "Ganesan", "Ravi", "Murugan"
        ];

        const motherNames = [
            "Lakshmi", "Anitha", "Saraswathi", "Meena", "Kala", "Revathi", "Sudha",
            "Priya", "Devi", "Gayathri", "Vanitha", "Mahalakshmi", "Radha", "Uma",
            "Janaki", "Deepa", "Sangeetha", "Jaya", "Bhuvana"
        ];

        const random = (arr) => {
            return arr[Math.floor(Math.random() * arr.length)];
        }

        let students = [];
        const last = await StudentsModal.findOne().sort({ studentId: -1 });
        let nextId = last ? last.studentId + 1 : 1;

        for (let i = 1; i <= 100; i++) {
            let student = new StudentsModal({
                studentId: nextId++,
                name: random(firstNames) + " " + random(lastNames),
                address: random(cities),
                class: random(classes)
            });

            students.push(student);
        }

        const savedStudents = await StudentsModal.insertMany(students);

        console.log("100 students inserted");

        let parents = [];

        savedStudents.forEach((s) => {
            let parent = new ParentsModal({
                studentId: s._id,
                fatherName: random(fatherNames),
                motherName: random(motherNames)
            })

            parents.push(parent);
        });

        await ParentsModal.insertMany(parents);

        console.log("100 parents inserted");

        res.json({
            success: true,
            message: "Data feeded successfully"
        })
    }

    getStudents = async (req, res) => {
        try {
            const {
                page = "1",
                limit = "10",
                sortBy = "name",
                sortOrder = "asc",
                search,
                ...fieldFilters
            } = req.query;

            const pageLimit = parseInt(limit);
            const pageNumber = parseInt(page);
            const skip = (pageNumber - 1) * pageLimit

            const match = {};

            for (const [key, value] of Object.entries(fieldFilters)) {
                if (["name", "address", "class"].includes(key)) {
                    match[key] = value;
                } else if (["fatherName", "motherName"].includes(key)) {
                    match[`parent.${key}`] = value;
                }
            }

            if (search && search.trim() !== "") {
                const regex = new RegExp(search.trim(), "i");

                match.$or = [
                    { name: regex },
                    { address: regex },
                    { class: regex },
                    { "parent.fatherName": regex },
                    { "parent.motherName": regex },
                ];
            }

            const sortKeys = {
                id: 'studentId',
                name: "name",
                address: "address",
                class: "class",
                fatherName: "parent.fatherName",
                motherName: "parent.motherName",
            }
            const sort = {};
            if (sortBy) {
                sort[sortKeys[sortBy]] = sortOrder === "desc" ? -1 : 1;
            }

            const pipeline = [
                {
                    $lookup: {
                        from: "parents",
                        localField: "_id",
                        foreignField: "studentId",
                        as: "parent",
                    },
                },
                {
                    $unwind: "$parent"
                },
                { $match: match },
                {
                    $facet: {
                        data: [
                            { $sort: sort },
                            { $skip: skip },
                            { $limit: pageLimit },
                            {
                                $project: {
                                    _id: 0,
                                    id: '$studentId',
                                    name: 1,
                                    address: 1,
                                    class: 1,
                                    fatherName: "$parent.fatherName",
                                    motherName: "$parent.motherName",
                                },
                            },
                        ],
                        meta: [{ $count: "total" }],
                    },
                },
            ];

            const [result] = await StudentsModal.aggregate(pipeline);
            const students = result?.data || [];
            const total = result?.meta?.[0]?.total || 0;

            res.json({
                success: true,
                data: result.data,
                pagination: {
                    page: pageNumber,
                    limit: pageLimit,
                    total,
                    totalPages: Math.ceil(total / pageLimit) || 0,
                },
                sort: {
                    sortBy,
                    sortOrder,
                },
            });
        } catch (err) {
            console.error("Error:", err);
            res.status(500).json({
                success: false,
                message: err.message || "Internal server error",
            });
        }
    };
}

module.exports = new Controller()