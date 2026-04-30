import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import { adminRouter } from "./routes/admin";

import { registerProcedure } from "./routes/users/register";
import { loginProcedure } from "./routes/users/login";
import { updateUserProcedure } from "./routes/users/update";
import { deleteUserProcedure } from "./routes/users/delete";
import { getAllUsersProcedure } from "./routes/users/getAll";

import { bookClassProcedure } from "./routes/bookings/book";
import { bookMultipleDatesProcedure } from "./routes/bookings/bookMultiple";
import { cancelBookingProcedure } from "./routes/bookings/cancel";
import { markAttendanceProcedure } from "./routes/bookings/markAttendance";
import { getStudentBookingsProcedure } from "./routes/bookings/getStudentBookings";
import { getClassBookingsProcedure } from "./routes/bookings/getClassBookings";
import { getAllBookingsProcedure } from "./routes/bookings/getAll";

import { bookPrivateSessionProcedure } from "./routes/sessions/book";
import { getStudentSessionsProcedure } from "./routes/sessions/getStudentSessions";
import { getAllSessionsProcedure } from "./routes/sessions/getAll";

import { createAnnouncementProcedure } from "./routes/announcements/create";
import { updateAnnouncementProcedure } from "./routes/announcements/update";
import { deleteAnnouncementProcedure } from "./routes/announcements/delete";
import { getAllAnnouncementsProcedure } from "./routes/announcements/getAll";

import { createGalleryItemProcedure } from "./routes/gallery/create";
import { updateGalleryItemProcedure } from "./routes/gallery/update";
import { deleteGalleryItemProcedure } from "./routes/gallery/delete";
import { getAllGalleryItemsProcedure } from "./routes/gallery/getAll";

import { createCoachProcedure } from "./routes/coaches/create";
import { updateCoachProcedure } from "./routes/coaches/update";
import { deleteCoachProcedure } from "./routes/coaches/delete";
import { getAllCoachesProcedure } from "./routes/coaches/getAll";

import { createClassProcedure } from "./routes/classes/create";
import { updateClassProcedure } from "./routes/classes/update";
import { deleteClassProcedure } from "./routes/classes/delete";
import { getAllClassesProcedure } from "./routes/classes/getAll";

import { createEventProcedure } from "./routes/events/create";
import { updateEventProcedure } from "./routes/events/update";
import { deleteEventProcedure } from "./routes/events/delete";
import { getAllEventsProcedure } from "./routes/events/getAll";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),

  admin: adminRouter,

  users: createTRPCRouter({
    register: registerProcedure,
    login: loginProcedure,
    update: updateUserProcedure,
    delete: deleteUserProcedure,
    getAll: getAllUsersProcedure,
  }),

  bookings: createTRPCRouter({
    book: bookClassProcedure,
    bookMultiple: bookMultipleDatesProcedure,
    cancel: cancelBookingProcedure,
    markAttendance: markAttendanceProcedure,
    getStudentBookings: getStudentBookingsProcedure,
    getClassBookings: getClassBookingsProcedure,
    getAll: getAllBookingsProcedure,
  }),

  sessions: createTRPCRouter({
    book: bookPrivateSessionProcedure,
    getStudentSessions: getStudentSessionsProcedure,
    getAll: getAllSessionsProcedure,
  }),

  announcements: createTRPCRouter({
    create: createAnnouncementProcedure,
    update: updateAnnouncementProcedure,
    delete: deleteAnnouncementProcedure,
    getAll: getAllAnnouncementsProcedure,
  }),

  gallery: createTRPCRouter({
    create: createGalleryItemProcedure,
    update: updateGalleryItemProcedure,
    delete: deleteGalleryItemProcedure,
    getAll: getAllGalleryItemsProcedure,
  }),

  coaches: createTRPCRouter({
    create: createCoachProcedure,
    update: updateCoachProcedure,
    delete: deleteCoachProcedure,
    getAll: getAllCoachesProcedure,
  }),

  classes: createTRPCRouter({
    create: createClassProcedure,
    update: updateClassProcedure,
    delete: deleteClassProcedure,
    getAll: getAllClassesProcedure,
  }),

  events: createTRPCRouter({
    create: createEventProcedure,
    update: updateEventProcedure,
    delete: deleteEventProcedure,
    getAll: getAllEventsProcedure,
  }),
});

export type AppRouter = typeof appRouter;
