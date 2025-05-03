//Receive an array of objects to manage in the format [{id:askdjsadajsdasjkdas, x:123, y:653},{id:54gerg3, x:323, y:143},{id:123ds1, x:542, y:531}]
//Return an array of all objects ids and positions in the format [{id:askdjsadajsdasjkdas, x:123, y:653},{id:54gerg3, x:323, y:143},{id:123ds1, x:542, y:531}]
function rpcManageObjects(ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, payload: any): string {
    logger.info("manage objects rpc called");

    const request = JSON.parse(payload);
    logger.info(payload);


    nk.storageWrite(request);

    let objectsList = nk.storageList(
        "00000000-0000-0000-0000-000000000000",
        "scene_objects",
        100,
        undefined 
    );
    // logger.info("objectsList: " + JSON.stringify(objectsList));


    // let storageReadReq: nkruntime.StorageReadRequest = {
    //     key: request.object_id,
    //     collection: "scene_objects",
    //     userId: "00000000-0000-0000-0000-000000000000",
    // }
    // let objects: nkruntime.StorageObject[] = nk.storageRead([storageReadReq]);
    // let storedCardCollection = objects[0].value;


    // logger.info("request: " + JSON.stringify(objectsList));


    return JSON.stringify(objectsList);
}