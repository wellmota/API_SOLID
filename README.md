# App

GymPass style app.

## FRs (Functional Requirements)

- [x] It should be possible to register;
- [x] It should be possible to authenticate;
- [x] It should be possible to get the profile of a logged-in user;
- [ ] It should be possible to get the number of check-ins made by the logged-in user;
- [ ] Users should be able to get their check-in history;
- [ ] Users should be able to search for nearby gyms;
- [ ] Users should be able to search for gyms by name;
- [ ] Users should be able to check-in at a gym;
- [ ] It should be possible to validate a user's check-in;
- [ ] It should be possible to register a gym;

## RN's (Regras de negócio)

- [x] User must not be able to register with a duplicated email
- [ ] User must not be able to check-in twice a day
- [ ] User must not be able to check-in if they are far from 100m from the gym
- [ ] Check-in can only be validated after 20 minutes after it has been created
- [ ] Check in can only be validated by admins
- [ ] Register Gyms is only available for Admins

## RNF's (Requisitos não-funcionais)

- [x] User password must be encryted
- [x] Data must be persist into a PostgreSQL
- [ ] All lists must be paginated with 20 items per page
- [ ] User must be identified by a JWT (JSON Web Token)

---
