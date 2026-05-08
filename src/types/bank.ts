export type Bank = {
  id: number;
  code: string;
  name: string;
  account_number: string;
  account_name: string;
  logo: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type BankListApiResponse = {
  status: boolean;
  code: number;
  data: {
    total_data: number;
    total_page: number;
    data: Bank[];
  };
  messages: string;
};
