import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
admin.initializeApp();
import { Cloud_Teleblitz } from "./cloud_Teleblitz";
export { Cloud_Teleblitz } from "./cloud_Teleblitz";
import { ChildPendRequest } from "./cloud_Functions/childPendRequest";
export { ChildPendRequest } from "./cloud_Functions/childPendRequest";
import { ParentPendAccept } from "./cloud_Functions/parendPendRequest";
import { Account } from "./cloud_Functions/account";
import { UserMap } from "./cloud_Functions/userMap";
import { GroupMap } from "./cloud_Functions/groupMap";
import { PushNotificationByTeleblitzCreated } from "./push_notification/teleblitz_create";
export { PushNotificationByTeleblitzCreated } from "./push_notification/teleblitz_create";
import { ChildUserMap } from "./cloud_Functions/childUserMap";
export { ParentPendAccept } from "./cloud_Functions/parendPendRequest";
import { Messages } from "./cloud_Functions/messages";
import { pathEvents } from "./param/morea_strings";
import { EventMap } from "./cloud_Functions/events";

const db = functions.region("europe-west1");

export const anmeldungTeleblitz = db.firestore
  .document("events/{eventID}/Anmeldungen/{anmeldeUID}")
  .onWrite(async (change, context) => {
    const tlbz = new Cloud_Teleblitz();
    return await tlbz.initfunction(change, context);
  });
export const childPendRequest = db.https.onCall(
  async (data: any, context: functions.https.CallableContext) => {
    const request = new ChildPendRequest();
    return await request.request(data, context);
  }
);
export const parendPendAccept = db.https.onCall(
  async (data: any, context: functions.https.CallableContext) => {
    const accept = new ParentPendAccept();
    await accept.accept(data, context);
    return;
  }
);
export const deleteUser = db.firestore
  .document("user/{userID}")
  .onDelete(async (snap, context) => {
    if (
      (await admin.auth().listUsers()).users.some((value) => {
        value.uid === context.params.userID;
        return true
      })
    ) {
      return admin
        .auth()
        .deleteUser(snap.id)
        .then(() => null)
        .catch((error) =>
          console.error("There was an error while deleting user:", error)
        );
    }
  });
export const createAccount = db.https.onCall(
  async (data: any, context: functions.https.CallableContext) => {
    const accont = new Account();
    return accont.create(data);
  }
);
export const uploadDevTocken = db.https.onCall(
  async (data: any, context: functions.https.CallableContext) => {
    const userMap = new UserMap();
    return userMap.deviceTokenUpdate(data, context);
  }
);
export const updateUserProfile = db.https.onCall(
  async (data: any, context: functions.https.CallableContext) => {
    const userMap = new UserMap();

    return userMap.update(data, context);
  }
);

export const goToNewGroup = db.https.onCall(
  async (data: any, context: functions.https.CallableContext) => {
    const groupMap = new GroupMap();
    return groupMap.goToNewGroup(data, context);
  }
);
export const leafeGroup = db.https.onCall(
  async (data: any, context: functions.https.CallableContext) => {
    const groupMap = new GroupMap();
    return groupMap.deSubFromGroup(data, context);
  }
);
export const joinGroup = db.https.onCall(
  async (data: any, context: functions.https.CallableContext) => {
    const groupMap = new GroupMap();
    const userMap = new UserMap();
    await userMap.groupIDUpdate(data, context);
    return groupMap.createUserPriviledgeEntry(data, context);
  }
);
export const updatePriviledgeEntry = db.https.onCall(
  async (data: any, context: functions.https.CallableContext) => {
    const groupMap = new GroupMap();
    return groupMap.updateUserPriviledgeEntry(data, context);
  }
);
export const createPriviledgeEntry = db.https.onCall(
  async (data: any, context: functions.https.CallableContext) => {
    const groupMap = new GroupMap();
    return groupMap.createUserPriviledgeEntry(data, context);
  }
);
export const makeLeiter = db.https.onCall(
  async (data: any, context: functions.https.CallableContext) => {
    const userMap = new UserMap();
    return userMap.makeLeiter(data, context);
  }
);
export const pushNotificationOnTeleblitzCreate = db.firestore
  .document("groups/{groupID}")
  .onWrite(async (change, context) => {
    const pushNotification = new PushNotificationByTeleblitzCreated();
    return pushNotification.groupLevelInit(change, context);
  });
export const pushNotificationOnTeleblitzWrite = db.firestore
  .document("events/{groupID}")
  .onWrite(async (change, context) => {
    const pushNotification = new PushNotificationByTeleblitzCreated();
    return pushNotification.eventLevelInit(change);
  });
export const createChildUserMap = db.https.onCall(
  async (data: any, context: functions.https.CallableContext) => {
    const childusermap = new ChildUserMap();
    return childusermap.create(data, context);
  }
);

export const upgradeChildMap = db.https.onCall(
  async (data: any, context: functions.https.CallableContext) => {
    const userMap = new UserMap();
    await userMap.updateAllParents(data, context);
    return userMap.create(data, context);
  }
);

export const createUserMap = db.https.onCall(
  async (data: any, context: functions.https.CallableContext) => {
    const userMap = new UserMap();
    return userMap.create(data, context);
  }
);

export const deleteUserMap = db.https.onCall(
  async (data: any, context: functions.https.CallableContext) => {
    const userMap = new UserMap();
    const groupMap = new GroupMap();
    await groupMap.deSubFromGroup(data, context);
    return userMap.delete(data, context);
  }
);

export const deleteChildMap = db.https.onCall(
  async (data: any, context: functions.https.CallableContext) => {
    const userMap = new UserMap();
    return userMap.delete(data, context);
  }
);

export const updatePriviledge = db.https.onCall(
  async (data: any, context: functions.https.CallableContext) => {
    const groupMap = new GroupMap();
    const dataupdate = {
      UID: data.UID,
      groupID: data.groupID,
      DisplayName: data.DisplayName,
    };
    const datadesub = {
      UID: data.oldUID,
      groupID: data.groupID,
    };
    console.error("Migrate to new parameter");
    await groupMap.createUserPriviledgeEntry(dataupdate, context);
    return groupMap.deSubFromGroup(datadesub, context);
  }
);

export const uploadAndNotifyMessage = db.https.onCall(
  async (data: any, context: functions.https.CallableContext) => {
    const messages = new Messages();
    await messages.uploadMessage(data, context);
    return messages.sendNotificationForMessage(data, context);
  }
);

export const deactivateDeviceNotification = db.https.onCall(
  async (data: any, context: functions.https.CallableContext) => {
    const userMap = new UserMap();
    return userMap.deactivateDeviceNotification(data, context);
  }
);

export const resetAnmeldungenTeleblitz = db.firestore.document(pathEvents + "/{eventID}").onUpdate(
  async (change, context) => {
    const eventMap = new EventMap();
    return eventMap.deleteAnmeldungen(change, context);
  }
)
