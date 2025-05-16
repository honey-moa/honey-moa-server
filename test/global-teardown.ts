module.exports = async function () {
  await globalThis.__POSTGRES_CONTAINER__.stop();
};
