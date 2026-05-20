export type MemberNotificationRow = {
  id: string;
  recipient_profile_id: string;
  kind: "birthday_reminder";
  subject_profile_id: string | null;
  notification_date: string;
  title: string;
  body: string;
  read_at: string | null;
  created_at: string;
};
