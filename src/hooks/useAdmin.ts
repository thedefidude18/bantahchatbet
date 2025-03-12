import { useCallback, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

export interface AdminStats {
  totalEvents: number;
  activeUsers: number;
  totalGroups: number;
  pendingReports: number;
}

export interface Report {
  id: string;
  reporter: {
    id: string;
    name: string;
    username: string;
  };
  reported: {
    id: string;
    name: string;
    username: string;
  };
  type: 'user' | 'group' | 'event';
  target_id: string;
  reason: string;
  status: 'pending' | 'resolved' | 'dismissed';
  created_at: string;
  resolved_at?: string;
  resolved_by?: {
    id: string;
    name: string;
  };
}

export interface AdminAction {
  id: string;
  admin: {
    id: string;
    name: string;
  };
  action_type: string;
  target_type: string;
  target_id: string;
  details: Record<string, any>;
  created_at: string;
}

export interface Withdrawal {
  id: string;
  wallet_id: string;
  amount: number;
  balance_type: 'real' | 'bonus';
  reference: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  bank_name: string;
  account_number: string;
  account_name: string;
  processed_at: string | null;
  created_at: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export function useAdmin() {
  const { currentUser } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const blockUser = useCallback(async (userId: string) => {
    if (!currentUser?.is_admin) {
      toast.showError('Only admins can block users');
      return false;
    }

    try {
      setLoading(true);
      const { error } = await supabase.rpc('block_user', { user_id: userId });

      if (error) throw error;

      toast.showSuccess('User blocked successfully');
      return true;
    } catch (error) {
      console.error('Error blocking user:', error);
      toast.showError('Failed to block user');
      return false;
    } finally {
      setLoading(false);
    }
  }, [currentUser, toast]);

  const unblockUser = useCallback(async (userId: string) => {
    if (!currentUser?.is_admin) {
      toast.showError('Only admins can unblock users');
      return false;
    }

    try {
      setLoading(true);
      const { error } = await supabase.rpc('unblock_user', { user_id: userId });

      if (error) throw error;

      toast.showSuccess('User unblocked successfully');
      return true;
    } catch (error) {
      console.error('Error unblocking user:', error);
      toast.showError('Failed to unblock user');
      return false;
    } finally {
      setLoading(false);
    }
  }, [currentUser, toast]);

  const deleteGroup = useCallback(async (groupId: string) => {
    if (!currentUser?.is_admin) {
      toast.showError('Only admins can delete groups');
      return false;
    }

    try {
      setLoading(true);
      const { error } = await supabase.rpc('delete_group', { group_id: groupId });

      if (error) throw error;

      toast.showSuccess('Group deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting group:', error);
      toast.showError('Failed to delete group');
      return false;
    } finally {
      setLoading(false);
    }
  }, [currentUser, toast]);

  const resolveReport = useCallback(async (reportId: string, resolution: string) => {
    if (!currentUser?.is_admin) {
      toast.showError('Only admins can resolve reports');
      return false;
    }

    try {
      setLoading(true);
      const { error } = await supabase.rpc('resolve_report', {
        report_id: reportId,
        resolution
      });

      if (error) throw error;

      toast.showSuccess('Report resolved successfully');
      return true;
    } catch (error) {
      console.error('Error resolving report:', error);
      toast.showError('Failed to resolve report');
      return false;
    } finally {
      setLoading(false);
    }
  }, [currentUser, toast]);

  const getStats = useCallback(async (): Promise<AdminStats> => {
    if (!currentUser?.is_admin) {
      throw new Error('Only admins can view stats');
    }

    try {
      setLoading(true);
      const [
        { count: totalEvents },
        { count: activeUsers },
        { count: totalGroups },
        { count: pendingReports }
      ] = await Promise.all([
        supabase.from('events').select('*', { count: 'exact' }),
        supabase.from('users').select('*', { count: 'exact' }).eq('is_blocked', false),
        supabase.from('chats').select('*', { count: 'exact' }).eq('is_group', true).eq('is_blocked', false),
        supabase.from('reports').select('*', { count: 'exact' }).eq('status', 'pending')
      ]);

      return {
        totalEvents: totalEvents || 0,
        activeUsers: activeUsers || 0,
        totalGroups: totalGroups || 0,
        pendingReports: pendingReports || 0
      };
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  const getReports = useCallback(async () => {
    if (!currentUser?.is_admin) {
      throw new Error('Only admins can view reports');
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('reports')
        .select(`
          *,
          reporter:reporter_id(id, name, username),
          reported:reported_id(id, name, username),
          resolver:resolved_by(id, name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data as Report[];
    } catch (error) {
      console.error('Error fetching reports:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  const getAuditLog = useCallback(async () => {
    if (!currentUser?.is_admin) {
      throw new Error('Only admins can view audit log');
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('admin_actions')
        .select(`
          *,
          admin:admin_id(id, name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data as AdminAction[];
    } catch (error) {
      console.error('Error fetching audit log:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  const getWithdrawals = useCallback(async (status?: string) => {
    if (!currentUser?.is_admin) {
      throw new Error('Only admins can view withdrawals');
    }

    try {
      setLoading(true);
      const query = supabase
        .from('withdrawals')
        .select(`
          *,
          wallet:wallet_id (
            user:user_id (
              id,
              name,
              email
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (status) {
        query.eq('status', status);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data as Withdrawal[];
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  const processWithdrawal = useCallback(async (
    withdrawalId: string,
    status: 'processing' | 'completed' | 'failed'
  ) => {
    if (!currentUser?.is_admin) {
      toast.showError('Only admins can process withdrawals');
      return false;
    }

    try {
      setLoading(true);
      const { error } = await supabase.rpc('admin_process_withdrawal', {
        p_withdrawal_id: withdrawalId,
        p_status: status,
        p_admin_id: currentUser.id
      });

      if (error) throw error;

      toast.showSuccess('Withdrawal processed successfully');
      return true;
    } catch (error) {
      console.error('Error processing withdrawal:', error);
      toast.showError('Failed to process withdrawal');
      return false;
    } finally {
      setLoading(false);
    }
  }, [currentUser, toast]);

  const withdrawPlatformFees = useCallback(async (amount: number) => {
    if (!currentUser?.is_admin) {
      throw new Error('Only admins can withdraw fees');
    }

    try {
      setLoading(true);
      const { error } = await supabase.rpc('withdraw_platform_fees', {
        p_amount: amount,
        p_admin_id: currentUser.id
      });

      if (error) throw error;

      toast.showSuccess('Fees withdrawn successfully');
      return true;
    } catch (error) {
      console.error('Error withdrawing fees:', error);
      toast.showError('Failed to withdraw fees');
      return false;
    } finally {
      setLoading(false);
    }
  }, [currentUser, toast]);

  return {
    loading,
    blockUser,
    unblockUser,
    deleteGroup,
    resolveReport,
    getStats,
    getReports,
    getAuditLog,
    getWithdrawals,
    processWithdrawal,
    withdrawPlatformFees
  };
}
