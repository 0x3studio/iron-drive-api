const express = require("express");
const createError = require("http-errors");

const { Wallet } = require("ethers");
const { WarpFactory } = require("warp-contracts");
const { buildEvmSignature } = require("warp-contracts-plugin-signature/server");

const app = express();

app.get("/", (req, res) => {
  res.send({ status: "ok" });
});

app.get("/:contractTxId", async (req, res, next) => {
  const contractTxId = req.params.contractTxId;

  const warp = WarpFactory.forMainnet({ inMemory: true, dbLocation: "2" });
  const wallet = Wallet.createRandom();

  const contract = warp
    .contract(contractTxId)
    .connect({ type: "ethereum", signer: buildEvmSignature(wallet) });

  try {
    const { cachedValue } = await contract.readState();
    res.send(
      Object.values(cachedValue.state.files).filter((item) => item.txId)
    );
  } catch (err) {
    next(createError(404));
  }
});

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.send({ status: "error" });
});

module.exports = app;
