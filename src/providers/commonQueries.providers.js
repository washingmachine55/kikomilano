export const GET_USER_EMAIL_FROM_ID = 'SELECT email FROM tbl_users where id = $1';
export const GET_USER_ID_FROM_EMAIL = 'SELECT id FROM tbl_users where email = $1';
export const CASE_EMAIL_CHECK = 'SELECT CASE WHEN EXISTS(SELECT email FROM tbl_users WHERE email = $1) THEN true ELSE false END AS ExistsCheck;'
export const GET_ALL_USER_DETAILS_BY_EMAIL = 'SELECT u.id, u.email, u.access_type, u.created_at, ud.first_name, ud.last_name, ud.images_id from tbl_users u JOIN tbl_users_details ud ON ud.users_id = u.id WHERE u.email = $1;'
export const GET_ALL_USER_DETAILS_BY_ID = 'SELECT u.id, u.email, u.access_type, u.created_at, ud.first_name, ud.last_name, i.image_url from tbl_users u JOIN tbl_users_details ud ON ud.users_id = u.id FULL JOIN tbl_images i ON i.id = ud.images_id WHERE u.id = $1;'