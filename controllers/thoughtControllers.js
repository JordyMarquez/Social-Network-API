// /api/thoughts

const { User, Thought } = require('../models')


module.exports = {
    // GET to get all thoughts
    getThoughts(req, res) {
        Thought.find()
            .then((thought) => res.json(thought))
            .catch((err) => res.status(500).json(err));
    },
    // GET to get a single thought by its _id
    getSingleThought(req, res) {
        Thought.findOne({ _id: req.params.thoughtId })
            .select('-__V')
            .then((thought) =>
                !thought
                    ? res.status(404).json({ message: 'No thought with that ID' })
                    : res.json(thought)
            )
            .catch((err) => res.status(500).json(err));
    },
    // POST to create a new thought (don't forget to push the created thought's _id to the associated user's thoughts array field)
    // // example data
    // {
    //   "thoughtText": "Here's a cool thought...",
    //   "username": "lernantino",
    //   "userId": "5edff358a0fcb779aa7b118b"
    // }
    createThought(req, res) {
        Thought.create(req.body)

            .then((thought) => {
                User.findOneAndUpdate({
                    _id: req.body.userId
                },
                    {
                        $push: {
                            thoughts: thought._id
                        }
                    })
                    .then(user => {
                        if (!user) {
                            res.status(500).json({ message: 'No user found' })
                        }
                        res.status(200).json({ message: 'created thought' })
                    })
            })
            .catch((err) => {
                console.log(err);
                return res.status(500).json(err);
            });
    },
    // PUT to update a thought by its _id
    updateThought(req, res) {
        Thought.findOneAndUpdate(
            { _id: req.params.thoughtId },
            { $set: req.body },
            { runValidators: true, new: true }
        )
            .then((thought) =>
                !thought
                    ? res.status(404).json({ message: 'No thought with this id' })
                    : res.json(thought)
            )
            .catch((err) => res.status(500).json(err));
    },
    // DELETE to remove a thought by its _id
    deleteThought(req, res) {
        Thought.findOneAndDelete({ _id: req.params.thoughtId })
            .then((thought) => {


                if (!thought) {
                    res.status(404).json({ message: "No thought with this ID" })

                }
                else {
                    return User.findOneAndUpdate(
                        { thoughts: req.params.thoughtId },
                        { $pull: { thoughts: req.params.thoughtId } },
                        { new: true }
                    )
                }
            })
            .then((user) =>
                !user
                    ? res.status(404).json({
                        message: 'Thought deleted, but no users found',
                    })
                    : res.json({ messsage: 'Thought successfuly deleted' }))
    },
    // /api/thoughts/:thoughtId/reactions

    // POST to create a reaction stored in a singlte thought's reactions array field
    addReaction(req, res) {
        console.log('You are adding a reaction');
        console.log(req.body);
        Thought.findOneAndUpdate(
            { _id: req.params.thoughtId },
            { $addToSet: { reactions: req.body } },
            { runValidators: true, new: true }
        )
            .then((thought) =>
                !thought
                    ? thought
                        .status(404)
                        .json({ message: 'No thought found with this id' })
                    : res.json(thought)
            )
            .catch((err) => res.status(500).json(err));
    },
    // DELETE to pull and remove a reaction by the reaction's reactionId value
    removeReaction(req, res) {
        Thought.findOneAndUpdate(
            { _id: req.params.thoughtId },
            { $pull: { reactions: { reactionId: req.params.reactionId } } },
            { runValidators: true, new: true }
        )
            .then((thought) =>
                !thought
                    ? res
                        .status(404)
                        .json({ message: 'No thought found with that id' })
                    : res.json(thought)
            )
            .catch((err) => res.status(500).json(err));
    },
};





