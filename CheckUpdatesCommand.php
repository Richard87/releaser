<?php

namespace ReleaserBundle\Command;

use Firebase\FirebaseInterface;
use Firebase\FirebaseLib as Firebase;
use Firebase\FirebaseLib;
use GuzzleHttp\Client;
use Psr\Log\LoggerInterface;
use Symfony\Bridge\Twig\TwigEngine;
use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Filesystem\LockHandler;
use Twig_Environment;

class CheckUpdatesCommand extends ContainerAwareCommand
{
    const URL_GITHUB = "https://github.com/";

    /**
     * {@inheritdoc}
     */
    protected function configure()
    {
        $this
            ->setName('releaser:check_updates')
            ->setDescription('Hello PhpStorm');
    }

    /**
     * {@inheritdoc}
     */
    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $lockHandler = new LockHandler("checking_new_feeds.lock");
        if (!$lockHandler->lock())
            return;

        $firebase = $this->getContainer()->get("app.firebase");
        $twig = $this->getContainer()->get("twig");
        $logger = $this->getContainer()->get("logger");
        $this->processWatchlist($firebase, $logger, $twig);
        $this->processNewWatchItems($firebase);


        $this->getContainer()->get("mailer")->getTransport()->start();
        $client = new Client();
        $client->get("http://beats.envoyer.io/heartbeat/7hm4dLgIuOpznTV");
    }

    /**
     * Send email to all users that subscribe to Repository
     *
     * @param $users
     * @param $data
     * @param FirebaseLib $firebase
     */
    protected function newPost($users, $data,FirebaseInterface $firebase, LoggerInterface $logger, Twig_Environment $twig) {
        foreach ($users as $userId => $user) {
            if (isset($user['watch'])) {
                foreach ($user['watch'] as $githubId => $githubName) {
                    if ($githubName == $data['repo_name']) {
                        $this->sendEmail($user['user'], $data,$logger, $twig);
                        $firebase->push("/users/$userId/config/emails", ['github' => $data['repo_name'], 'timestamp' => time(), 'title' => $data['title']]);
                    }
                }
            }
        }
    }

    /**
     * Send email to user about new post
     *
     * @param $user
     * @param $data
     */
    protected function sendEmail($user, $data, LoggerInterface $logger, Twig_Environment $twig) {

        $email = $user['email'];
        $displayName = $user['displayName'] ?? null;
        $logger->info("sending email", [
            'data' => $data,
            'user' => $user,
            'email' => $email,
            'name' => $displayName,
        ]);

        $content = $twig->render("ReleaserBundle:Default:email.html.twig",[
            'data' => $data,
            'user' => $user,
        ]);
        $message = \Swift_Message::newInstance()
            ->setReplyTo("hi@richardhagen.no","Richard Hagen")
            ->setSubject("{$data['title']} just published by {$data['repo_name']}")
            ->setFrom('releaser@richardhagen.no', 'Releaser')
            ->setTo($email, $displayName)
            ->setBody($content, 'text/html')
        ;
        $swift_Mailer = $this->getContainer()->get('mailer');
        $swift_Mailer->send($message);
    }

    /**
     * Get latest feed from repo
     *
     * @param $repoName
     * @return array|null
     */
    protected function getFeedItem($repoName)
    {
        $baseUrl = self::URL_GITHUB;
        $simplePie = new \SimplePie();
        $simplePie->enable_cache(false);
        $simplePie->set_feed_url("$baseUrl$repoName/releases.atom");
        $simplePie->init();
        /** @var \SimplePie_Item[] $items */
        $items = @$simplePie->get_items();

        if (count($items) == 0) {
            return null;
        }

        $data = [
            "time" => $items[0]->get_date(),
            "link" => $items[0]->get_link(),
            "author" => $items[0]->get_author(),
            "title" => $items[0]->get_title(),
            "content" => $items[0]->get_content(),
            "id" => $items[0]->get_id(),
            'repo_name' => $repoName,
            'repo_url' => $baseUrl . $repoName,
            'last_checked' => time(),
        ];
        return $data;
    }

    /**
     * @param $firebase
     */
    protected function processNewWatchItems(FirebaseInterface $firebase)
    {
        $latestFeeds = json_decode($firebase->get("latest_feeds"), true);
        $users = json_decode($firebase->get("users"), true);
        $githubIds = array_keys($latestFeeds);
        foreach ($users as $userId => $user) {
            if (isset($user['watch'])) foreach ($user['watch'] as $githubId => $githubName) {
                if (!in_array($githubId, $githubIds)) {
                    $data = $this->getFeedItem($githubName);
                    $data['last_checked'] = time();
                    $firebase->set("latest_feeds/$githubId", $data);
                }
            }
        }
    }

    /**
     * Check watchlist for new items
     *
     * @param FirebaseInterface|FirebaseLib $firebase
     * @param LoggerInterface $logger
     * @param TwigEngine $twig
     */
    protected function processWatchlist(FirebaseInterface $firebase, LoggerInterface $logger, \Twig_Environment $twig)
    {
        $latestFeeds = json_decode($firebase->get("latest_feeds"), true);
        $users = json_decode($firebase->get("users"), true);

        foreach ($latestFeeds as $githubId => $feed) {
            if (isset($feed['last_checked']) && $feed['last_checked'] > time() - (30 * 60))
                continue; // Only check once every 30 minutes


            $data = $this->getFeedItem($feed['repo_name']);
            if ($data) {
                $firebase->set("latest_feeds/$githubId", $data);

                $time = new \DateTime($data['time']);
                $oldTime = new \DateTime($feed['time']);
                if ($time > $oldTime) { // New post
                    $this->newPost($users, $data, $firebase, $logger, $twig);
                }
            }

            $firebase->set("latest_feeds/$githubId/last_checked", time());
        }
    }
}
