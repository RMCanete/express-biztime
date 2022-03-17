const express = require("express");
const ExpressError = require("../expressError");
const db = require("../db");
let router =  new express.Router();

router.get('/', async (req, res, next) => {
    try {
      const results = await db.query(`SELECT id, comp_code FROM invoices`);
      return res.json({ "invoices": results.rows });
    } catch (e) {
      return next(e);
    }
});

router.get('/:id', async (req, res, next) => {
    try {
      let { id } = req.params;

      const results = await db.query(`SELECT invoice.id, invoice.comp_code, invoice.amt, invoice.paid, invoice.add_date, invoice.paid_date, company.name, company.description
       FROM invoices AS invoice 
       INNER JOIN companies AS company 
       ON (invoice.comp_code = company.code) 
       WHERE id = $1`, [id]);

      if (results.rows.length === 0) {
        throw new ExpressError(`Can't find code of ${code}`, 404)
      }

      let result = results.rows[0]
      let invoice = {
          id: result.id,
          amt: result.amt,
          paid: result.paid,
          add_date: result.add_date,
          paid_date: result.paid_date,
          company: {
              code: result.comp_code,
              name: result.name,
              description: result.description
          }
      };
      return res.send({ "invoice": invoice })
    } catch (e) {
      return next(e)
    }
});

router.post('/', async (req, res, next) => {
    try {
      let { comp_code, amt } = req.body;

      const results = await db.query('INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) RETURNING id, comp_code, amt, paid, add_date, paid_date', [comp_code, amt]);
      return res.status(201).json({ "invoice": results.rows[0] })
    } catch (e) {
      return next(e)
    }
})

router.put('/:id', async (req, res, next) => {
    try {
      let { id } = req.params;
      let { amt } = req.body;

      const results = await db.query(`UPDATE invoices SET amt=$1 WHERE id = $2 RETURNING id, comp_code, amt, paid, add_date, paid_date`, [amt, id]);
      if (results.rows.length === 0) {
        throw new ExpressError(`Can't find code of ${code}`, 404)
      }
      return res.send({ "invoice": results.rows[0] })
    } catch (e) {
      return next(e)
    }
});

router.delete('/:id', async (req, res, next) => {
    try {
      let { id } = req.params;

      const results = await db.query('DELETE FROM invoices WHERE id = $1 RETURNING id', [id])
      if (results.rows.length === 0) {
        throw new ExpressError(`Can't find code of ${code}`, 404)
      }
      return res.json({ status: "deleted" })
    } catch (e) {
      return next(e)
    }
})

  module.exports = router;