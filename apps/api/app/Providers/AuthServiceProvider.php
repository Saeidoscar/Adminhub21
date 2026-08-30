<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Gate;
use App\Models\User;
use App\Models\Story;
use App\Models\Blog;
use App\Models\Comment;
use App\Models\Ticket;
use App\Models\Contract;
use App\Policies\UserPolicy;
use App\Policies\StoryPolicy;
use App\Policies\BlogPolicy;
use App\Policies\CommentPolicy;
use App\Policies\TicketPolicy;
use App\Policies\ContractPolicy;

class AuthServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        Gate::before(function ($user, $ability) {
            return $user->hasRole('super_admin') ? true : null;
        });

        Gate::define('admin-access', fn ($user) => $user->hasRole('admin') || $user->hasRole('super_admin'));

        Gate::define('super-admin-only', fn ($user) => $user->hasRole('super_admin'));

        Gate::policy(User::class, UserPolicy::class);
        Gate::policy(Story::class, StoryPolicy::class);
        Gate::policy(Blog::class, BlogPolicy::class);
        Gate::policy(Comment::class, CommentPolicy::class);
        Gate::policy(Ticket::class, TicketPolicy::class);
        Gate::policy(Contract::class, ContractPolicy::class);
    }
}
