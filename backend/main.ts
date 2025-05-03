function InitModule(ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, initializer: nkruntime.Initializer) {
  initializer.registerRpc("healthcheck", rpcHealthcheck);
  initializer.registerRpc("manageobjects", rpcManageObjects);
  logger.info("Javascript module loaded");
}

globalThis.InitModule = InitModule;
