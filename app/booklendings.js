const express = require('express');
const router = express.Router();
const Booklending = require('./models/Booklending'); // get our mongoose model



/**
 * Resource representation based on the following the pattern: 
 * https://cloud.google.com/blog/products/application-development/api-design-why-you-should-use-links-not-keys-to-represent-relationships-in-apis
 */
router.get('', async (req, res) => {
    let booklendings;

    if ( req.query.studentId )
        booklendings = await Booklending.find({
            studentId: req.query.studentId
        }).exec();
    
    else
        booklendings = await Booklending.find({}).exec();

    booklendings = booklendings.map( (dbEntry) => {
        return {
            self: '/api/v1/booklendings/' + dbEntry.id,
            student: '/api/v1/students/' + dbEntry.studentId,
            book: '/api/v1/books/' + dbEntry.bookId
        };
    });

    res.status(200).json(booklendings);
});



router.post('', async (req, res) => {
    let studentUrl = req.body.student;
    let bookUrl = req.body.book;

    if (!studentUrl){
        res.status(400).json({ error: 'Student not specified' });
        return;
    };
    
    if (!bookUrl) {
        res.status(400).json({ error: 'Book not specified' });
        return;
    };
    
    let studentId = studentUrl.substring(studentUrl.lastIndexOf('/') + 1);
    let student = db.students.findById(studentId);

    if(!student) {
        res.status(400).json({ error: 'Student does not exist' });
        return;
    };

    let bookId = bookUrl.substring(bookUrl.lastIndexOf('/') + 1);
    let book = db.books.findById(bookId);
    
    if(!book) {
        res.status(400).json({ error: 'Book does not exist' });
        return; 
    };

    if(db.booklendings.findByBookId(bookId)) {
        res.status(409).json({ error: 'Book already out' });
        return
    }
    
	let booklending = new Booklending({
        studentId: studentId,
        bookId: bookId,
    });
    
	booklending = await booklending.save();
    
    let booklendingId = booklending.id;
    
    res.location("/api/v1/booklendings/" + booklendingId).status(201).send();
});



module.exports = router;