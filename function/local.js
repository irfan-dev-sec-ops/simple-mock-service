const app = require('./server');
// run the server locally
const port = process.env.PORT || 9080;
app.listen(port, () => {
    console.log(`Simple Mock Server is running at http://localhost:${port}`);
});
