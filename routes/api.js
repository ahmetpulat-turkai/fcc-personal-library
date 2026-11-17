'use strict';
const crypto = require('crypto');

// shortcut: bellekte tutulur (sunucu kapanınca silinir), kalıcılık gerekirse MongoDB'ye taşı
let books = [];
const view = b => ({ _id: b._id, title: b.title, comments: b.comments, commentcount: b.comments.length });

module.exports = function (app) {

  app.route('/api/books')
    .get((req, res) => res.json(books.map(b => ({ _id: b._id, title: b.title, commentcount: b.comments.length }))))
    .post((req, res) => {
      const title = req.body.title;
      if (!title) return res.send('missing required field title');
      const b = { _id: crypto.randomBytes(12).toString('hex'), title, comments: [] };
      books.push(b);
      res.json({ _id: b._id, title: b.title });
    })
    .delete((req, res) => { books = []; res.send('complete delete successful'); });

  app.route('/api/books/:id')
    .get((req, res) => {
      const b = books.find(x => x._id === req.params.id);
      if (!b) return res.send('no book exists');
      res.json({ _id: b._id, title: b.title, comments: b.comments });
    })
    .post((req, res) => {
      const comment = req.body.comment;
      if (!comment) return res.send('missing required field comment');
      const b = books.find(x => x._id === req.params.id);
      if (!b) return res.send('no book exists');
      b.comments.push(comment);
      res.json({ _id: b._id, title: b.title, comments: b.comments, commentcount: b.comments.length });
    })
    .delete((req, res) => {
      const i = books.findIndex(x => x._id === req.params.id);
      if (i < 0) return res.send('no book exists');
      books.splice(i, 1);
      res.send('delete successful');
    });

};
