<?php

namespace Database\Seeders;

use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SampleDataSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function () {
            // Users (only if none)
            if (DB::table('tbl_users')->count() === 0) {
                $userId1 = DB::table('tbl_users')->insertGetId([
                    'fullname' => 'Alice Johnson',
                    'username' => 'alice',
                    'user_email' => 'alice@example.com',
                    'login_method' => 'email',
                    'device' => 0,
                    'bio' => 'Hello from Alice',
                ]);

                $userId2 = DB::table('tbl_users')->insertGetId([
                    'fullname' => 'Bob Smith',
                    'username' => 'bob',
                    'user_email' => 'bob@example.com',
                    'login_method' => 'email',
                    'device' => 1,
                    'bio' => 'Bob here!'
                ]);

                $userId3 = DB::table('tbl_users')->insertGetId([
                    'fullname' => 'Charlie Davis',
                    'username' => 'charlie',
                    'user_email' => 'charlie@example.com',
                    'login_method' => 'email',
                    'device' => 0,
                    'bio' => 'I like short videos',
                ]);

                // User Links
                DB::table('user_links')->insert([
                    [
                        'user_id' => $userId1,
                        'title' => 'Website',
                        'url' => 'https://example.com/alice',
                    ],
                    [
                        'user_id' => $userId2,
                        'title' => 'GitHub',
                        'url' => 'https://github.com/bob',
                    ],
                ]);

                // Followers (charlie -> follows -> alice)
                DB::table('tbl_followers')->insert([
                    'from_user_id' => $userId3,
                    'to_user_id' => $userId1,
                ]);

                // Blocks (bob blocks charlie)
                DB::table('tbl_user_block')->insert([
                    'from_user_id' => $userId2,
                    'to_user_id' => $userId3,
                ]);
            } else {
                $userId1 = DB::table('tbl_users')->min('id');
                $userId2 = DB::table('tbl_users')->max('id');
                $userId3 = DB::table('tbl_users')->orderBy('id', 'desc')->skip(1)->value('id') ?? $userId1;
            }

            // Languages (ensure EN exists)
            if (DB::table('languages')->count() === 0) {
                DB::table('languages')->insert([
                    'code' => 'en',
                    'title' => 'English',
                    'localized_title' => 'English',
                    'status' => 1,
                    'is_default' => 1,
                ]);
            }

            // Username restrictions
            if (DB::table('restriction_username')->count() === 0) {
                DB::table('restriction_username')->insert([
                    ['username' => 'admin'],
                    ['username' => 'support'],
                ]);
            }

            // Sound categories and sounds
            if (DB::table('tbl_sound_category')->count() === 0) {
                $catId = DB::table('tbl_sound_category')->insertGetId([
                    'name' => 'Trending',
                    'image' => null,
                ]);

                $soundId = DB::table('tbl_sound')->insertGetId([
                    'category_id' => $catId,
                    'post_count' => 0,
                    'added_by' => 1,
                    'user_id' => $userId1 ?? null,
                    'title' => 'Sunny Vibes',
                    'sound' => 'sounds/sunny_vibes.mp3',
                    'duration' => '00:30',
                    'artist' => 'DJ Sample',
                    'image' => 'images/sunny_vibes.jpg',
                ]);
            } else {
                $soundId = DB::table('tbl_sound')->value('id');
            }

            // Posts
            if (DB::table('tbl_post')->count() === 0) {
                $post1 = DB::table('tbl_post')->insertGetId([
                    'post_type' => 1, // reel
                    'user_id' => $userId1 ?? null,
                    'sound_id' => $soundId ?? null,
                    'description' => 'My first reel!',
                    'hashtags' => '#first #reel',
                    'video' => 'videos/reel1.mp4',
                    'thumbnail' => 'thumbnails/reel1.jpg',
                    'country' => 'US',
                ]);

                $post2 = DB::table('tbl_post')->insertGetId([
                    'post_type' => 2, // image
                    'user_id' => $userId2 ?? null,
                    'description' => 'A beautiful day',
                    'hashtags' => '#photo #day',
                    'thumbnail' => 'thumbnails/pic1.jpg',
                    'country' => 'US',
                ]);

                // Post images for post2
                DB::table('post_images')->insert([
                    ['post_id' => $post2, 'image' => 'images/pic1.jpg'],
                ]);

                // Saves and Likes
                DB::table('post_saves')->insert([
                    ['user_id' => $userId3 ?? null, 'post_id' => $post1],
                ]);

                DB::table('tbl_likes')->insert([
                    'post_id' => $post1,
                    'user_id' => $userId3 ?? null,
                ]);

                // Comments and replies
                $commentId = DB::table('tbl_comments')->insertGetId([
                    'post_id' => $post1,
                    'user_id' => $userId2 ?? null,
                    'comment' => 'Nice post!',
                ]);

                DB::table('comment_replies')->insert([
                    'comment_id' => $commentId,
                    'user_id' => $userId1 ?? null,
                    'reply' => 'Thank you!'
                ]);

                DB::table('comment_likes')->insert([
                    'comment_id' => $commentId,
                    'user_id' => $userId3 ?? null,
                ]);

                // Reports
                DB::table('report_posts')->insert([
                    'reason' => 'Abusive Content',
                    'description' => 'Inappropriate caption',
                    'post_id' => $post2,
                    'by_user_id' => $userId3 ?? null,
                ]);

                // User notifications
                DB::table('notification_users')->insert([
                    'from_user_id' => $userId3 ?? null,
                    'to_user_id' => $userId1 ?? null,
                    'type' => 1, // like
                    'data_id' => $post1,
                ]);
            }

            // Stories
            if (DB::table('stories')->count() === 0) {
                DB::table('stories')->insert([
                    'user_id' => $userId2 ?? null,
                    'type' => 0,
                    'content' => 'stories/story1.jpg',
                    'thumbnail' => 'stories/story1_thumb.jpg',
                    'duration' => '05',
                    'sound_id' => $soundId ?? null,
                ]);
            }

            // Gifts
            if (DB::table('tbl_gifts')->count() === 0) {
                DB::table('tbl_gifts')->insert([
                    ['coin_price' => 10, 'image' => 'gifts/heart.png'],
                    ['coin_price' => 50, 'image' => 'gifts/diamond.png'],
                ]);
            }

            // Coin plans
            if (DB::table('tbl_coin_plan')->count() === 0) {
                DB::table('tbl_coin_plan')->insert([
                    [
                        'image' => null,
                        'status' => 1,
                        'coin_amount' => 100,
                        'coin_plan_price' => 0.99,
                        'playstore_product_id' => 'coins_100',
                        'appstore_product_id' => 'coins_100',
                    ],
                    [
                        'image' => null,
                        'status' => 1,
                        'coin_amount' => 550,
                        'coin_plan_price' => 4.99,
                        'playstore_product_id' => 'coins_550',
                        'appstore_product_id' => 'coins_550',
                    ],
                ]);
            }

            // Redeem request (requires existing gateways; DB dump includes them)
            if (DB::table('tbl_redeem_request')->count() === 0) {
                $uid = $userId1 ?? DB::table('tbl_users')->value('id');
                if ($uid) {
                    DB::table('tbl_redeem_request')->insert([
                        'user_id' => $uid,
                        'request_number' => 'RR-0001',
                        'gateway' => 'PayPal',
                        'account' => 'alice@example.com',
                        'amount' => '5.00',
                        'coins' => 500,
                        'coin_value' => 0.01,
                        'status' => 0,
                    ]);
                }
            }

            // Admin notification
            if (DB::table('notification_admin')->count() === 0) {
                DB::table('notification_admin')->insert([
                    'title' => 'Welcome to Shortzz Admin',
                    'description' => 'Sample data seeded successfully.',
                    'image' => null,
                ]);
            }

            // Dummy live videos
            if (DB::table('dummy_live_videos')->count() === 0) {
                DB::table('dummy_live_videos')->insert([
                    'status' => 1,
                    'title' => 'Live: Sample Stream',
                    'user_id' => $userId3 ?? null,
                    'link' => 'https://example.com/live/1',
                ]);
            }

            // Daily active users (yesterday)
            if (DB::table('daily_active_users')->count() === 0) {
                DB::table('daily_active_users')->insert([
                    'date' => Carbon::yesterday()->toDateString(),
                    'user_count' => 2,
                ]);
            }
        });
    }
}

