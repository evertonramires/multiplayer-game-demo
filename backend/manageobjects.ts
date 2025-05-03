function rpcManageObjects(ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, payload: string): string {
    logger.info("manage objects rpc called");
    const request = JSON.parse(payload);
    logger.info("request: " + JSON.stringify(request));
    return JSON.stringify(request);
}