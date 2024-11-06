import unittest
from exploits.forge_admin_account import AdminAccount, InvulnerabilityError


class TestExploits(unittest.TestCase):
    def test_admin_registration_fails(self):
        """Test new admin account via forged HTML form fails"""
        with self.assertRaises(InvulnerabilityError):
            AdminAccount.new()


if __name__ == '__main__':
    unittest.main()
