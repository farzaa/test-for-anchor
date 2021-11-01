use anchor_lang::prelude::*;

declare_id!("9FrrosjwWBSuGXyLQSAcEUytyuAjSxZe47v3xUEb4XNR");

#[program]
mod mysolanaapp {
    use super::*;

    pub fn create(ctx: Context<Create>) -> ProgramResult {
        let base_account = &mut ctx.accounts.base_account;
        base_account.count = 0;
        Ok(())
    }

    pub fn increment(ctx: Context<Increment>) -> ProgramResult {
        let base_account = &mut ctx.accounts.base_account;
        base_account.count += 1;

        let cs = CustomStruct {
            num: 0,
            name: "farza".to_string(),
        };

        base_account.data_list.push(cs);

        Ok(())
    }
}

// Transaction instructions
#[derive(Accounts)]
pub struct Create<'info> {
    #[account(init, payer = user, space = 320)]
    pub base_account: Account<'info, BaseAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program <'info, System>,
}

// Transaction instructions
#[derive(Accounts)]
pub struct Increment<'info> {
    #[account(mut)]
    pub base_account: Account<'info, BaseAccount>,
}

#[derive(Debug, Clone, AnchorSerialize, AnchorDeserialize)]
pub struct CustomStruct {
    pub num: u64,
    pub name: String,
}

#[account]
pub struct BaseAccount {
    pub count: u64,
    pub data_list: Vec<CustomStruct>,
}